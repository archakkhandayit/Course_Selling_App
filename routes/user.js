const { Router } = require("express");
const userRouter = Router();
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { z } = require("zod");

const { userAuth } = require("../middleware/user");
const { userModel, courseModel, purchaseModel } = require("../db");
const { JWT_USER_SECRETS } = require("../config");

userRouter.post("/signup",async function ( req, res ){

    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    // -- ZOD VALIDATION
    const requiredBody = z.object({
        email: z.string().min(5).max(100).email(),

        password: z.string().min(4).max(100),
            // -- OUR PASSWORD MUST CONTAIN '$'AND '*'. IMPLEMENTED USING Z.REFINE() CUSTOM LOGIC
            // password: z.string().min(4).max(100).refine((password)=> {
        //     if(!password.includes("$" && "*")){
        //         return false
        //     } else return true
        // }),
        firstName: z.string().min(2).max(100),
        lastName: z.string().min(2).max(100)
    });
    const parsedBody = requiredBody.safeParse(req.body);

    if(!parsedBody.success){
        return res.json({
                    message: "Incorrect format",
                    error: parsedBody.error
        })
    }

    const hashedPassword =await bcryptjs.hash(password, 10);

    try{
        await userModel.create({
            email,
            password : hashedPassword,
            plainPassword :  password,
            firstName,
            lastName
        });

        res.json({
            message: "user signed up successfully"
        })
    } catch(e){
        console.error(e);
        res.status(500).json({
            message: "Can not sign up"
        })
    }
});

userRouter.post("/signin",async function ( req, res ){

    const email = req.body.email;
    const password = req.body.password;
    let foundUser = undefined;
    try{
        foundUser = await userModel.findOne({
            email: email
        })
    } catch(e){
        res.json({
            message: "User not signed up"
        })
    }

    if(foundUser){
        const passwordMatched = await bcryptjs.compare(password, foundUser.password)
        if(passwordMatched){
            const token = jwt.sign({
            userId: foundUser._id,
            }, JWT_USER_SECRETS)

                res.json({
                token: token,
            })
        } else{
            res.status(401).json({
                message: "Wrong password"
            })
        }
    } else{
        res.status(401).json({
            message: "Wrong Credentials"
        })
    }
});

    
userRouter.get("/purchases",userAuth,async function ( req, res ){

    const userId = req.userId;

    let purchases = undefined;
    try{
        purchases = await purchaseModel.find({
        userId
    }) 
    } catch(e) {
        res.status(500).json({
            message: "Something went wrong"
        })
    }
    

    let purchasedCourseIds = [];
    
    for(let i = 0; i<purchases.length;i++){
        purchasedCourseIds.push(purchases[i].courseId)
    }
    let coursesData = undefined;

    try{
        coursesData = await courseModel.find({
        _id: { $in : purchasedCourseIds }
    })

    res.json({
        purchases,
        coursesData
    })
    } catch(e){
        res.status(500).json({
            message: "course content not found"
        })
    }
    
});

module.exports = {
    userRouter
}
