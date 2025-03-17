const   jwt = require("jsonwebtoken")
const { JWT_ADMIN_SECRETS } = require("../config");  //will "../dotenv.config()" won't work or what?

function adminAuth(req, res, next){
    const token = req.headers.token;
    const verifiedToken = jwt.verify(token, JWT_ADMIN_SECRETS);

    if (verifiedToken){
        req.adminId = verifiedToken.adminId;
        next()
    } else{
        res.status(403).json({
            message: "Admin not signed in"
        })
    }
}

module.exports = {
    adminAuth
}