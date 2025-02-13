const { Router } = require("express");
const courseRouter = Router();


const { courseModel, purchaseModel } = require("../db");
const { userAuth } = require("../middleware/user");

courseRouter.post("/purchase",userAuth,async function (req, res){

    const userId = req.userId;
    const courseId = req.body.courseId;

    try{
        await purchaseModel.create({
            userId,
            courseId    
        });

        res.json({
            messge: "You have successfully bought the course"
        })
    } catch(e){
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});
    
courseRouter.get("/preview",async function (req, res){

    try{
        const allCourses = await courseModel.find({});

        res.json({
            allCourses
        })
    } catch(e){
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});

module.exports = {
    courseRouter
}