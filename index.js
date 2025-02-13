require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")


const { userRouter } = require("./routes/user");
const { adminRouter } = require("./routes/admin");
const { courseRouter } = require("./routes/course");

const { MONGODB_CREDENTIALS, APP_PORT } = require("./config")

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", () => {
    res.status(200).json({
        "App is running"
    });
});
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

(async function main(){
    const port = APP_PORT || 5000 ;
    // await mongoose.connect("process.env.MONGODB_CREDENTIALS")
    await mongoose.connect(MONGODB_CREDENTIALS)
    app.listen(port, () => console.log("listening in port " + port))
})();

// main();
