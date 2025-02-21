const { Router } = require("express")
const adminRouter = Router();
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const { adminAuth } = require("../middleware/admin")
const { adminModel, courseModel } = require("../db");
const { JWT_ADMIN_SECRETS } = require("../config")


adminRouter.post("/signup",async function (req, res){

    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;


    
    const hashedPassword =await bcryptjs.hash(password, 10);

    try{
        await adminModel.create({
            email,
            password : hashedPassword,
            plainPassword :  password,
            firstName,
            lastName
        });
        
        res.json({
        message : "admin is signed up successfully"
    })
    } catch(e){
        console.error(e);
        res.status(500).json({
            message: "Can not sign up"
        })
    }
});

adminRouter.post("/signin",async function (req, res){
    const email = req.body.email;
    const password = req.body.password;
    let foundAdmin = undefined;
    try{
        foundAdmin = await adminModel.findOne({
            email: email
        });
    } catch(e){
        res.json({
            message: "Admin not signed up"
        })
    }

    if(foundAdmin){
        const passwordMatched = await bcryptjs.compare(password, foundAdmin.password);
        if(passwordMatched){
            const token = jwt.sign({
            adminId: foundAdmin._id,
            }, JWT_ADMIN_SECRETS)

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
})

adminRouter.post("/course",adminAuth ,async function (req, res){

    const adminId = req.adminId;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;

    try{
        const course = await courseModel.create({
            title: title,
            description: description,
            price: price,
            imageUrl: imageUrl,
            creatorId: adminId
        });

        res.json({
            message: "course created",
            courseId: course._id
        })
    } catch(e){
        res.status(500).json({
            message: "Course not created"
        })
    }
});

// Returns a specific with courseId
adminRouter.post("/courseById", adminAuth, async function (req, res) {
    const adminId = req.adminId;
    const courseId = req.body.courseId; // Get courseId from the request body

    if (!courseId) {
        return res.status(400).json({
            message: "courseId is required"
        });
    }

    try {
        // Find the course by its ID and ensure the admin is the creator of that course
        const course = await courseModel.findOne({ _id: courseId, creatorId: adminId });

        if (!course) {
            return res.status(404).json({
                message: "Course not found or you're not authorized to view this course"
            });
        }

        res.json({
            message: "Course retrieved successfully",
            course: course
        });
    } catch (e) {
        res.status(500).json({
            message: "Error retrieving course"
        });
    }
});

adminRouter.put("/course",adminAuth,async function (req, res){

    const adminId = req.adminId;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const courseId = req.body.courseId;

    try {
        // Use $set to update only specific fields
        const result = await courseModel.updateOne(
            { _id: courseId, creatorId: adminId },  // filter
            {
                $set: { // update specific fields
                    title,
                    description,
                    price,
                    imageUrl
                }
            } 
        );
        console.log(result);

        // Check if the course was found and updated
        if (result.matchedCount === 0) {
            // If no document matched the filter, course not found or wrong creatorId
            return res.status(404).json({
                message: "Course not found or you are not the creator"
            });
        }

        if (result.modifiedCount === 0) {
            // If modifiedCount is 0, it means the document was matched, but no fields were actually changed
            return res.json({
                message: "Course already up-to-date, no changes were made"
            });
        }

         // Fetch the updated course
         const updatedCourse = await courseModel.findById(courseId);
         if (!updatedCourse) {
             return res.status(404).json({
                 message: "Course not found after update"
             });
         }

         // Return the updated course
        res.json({
            message: "Course updated successfully",
            course: updatedCourse
        });
        
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Error occured"
        });
    }
});

adminRouter.get("/course/bulk",adminAuth,async function (req, res){

    const adminId = req.adminId;
    let courses = undefined
    try{
        courses = await courseModel.find({
        creatorId:adminId
        });

        res.json({
            courses
        })
    } catch(e){
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});

adminRouter.delete("/course", adminAuth, async function (req, res){

    const adminId = req.adminId;
    const courseId = req.body.courseId;
    
    try{

        const isDeleted = await courseModel.deleteOne({
            creatorId: adminId,
            _id : courseId
        })

        console.log(isDeleted)

        if(isDeleted.deletedCount>0){
            res.json({

                message: "course deleted successfully"
            })
        } else{
            
            res.status(404).json({

                message: "course not found"
            })
        }
    } catch(e){
        res.status(500).json({

            message: "Something went wrong"
        })
    }


})
module.exports = {
    adminRouter
}
