const   jwt = require("jsonwebtoken")
const { JWT_USER_SECRETS } = require("../config")  //will "../dotenv.config()" won't work or what?

function userAuth(req, res, next){
    const token = req.headers.token;
    const verifiedToken = jwt.verify(token, JWT_USER_SECRETS);

    if (verifiedToken){
        req.userId = verifiedToken.userId;
        next();
    } else{
        res.status(403).json({
            message: "User not signed in"
        })
    }
}

module.exports = {
    userAuth
}