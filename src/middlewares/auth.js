const jwt = require("jsonwebtoken");

//===================================================[API:FOR AUTHENTICATION]===========================================================
exports.authentication = async function (req, res, next) {
    try {
        const bearerHeader = req.headers['authorization'];
        //check if bearer is undefined
        if (typeof bearerHeader !== 'undefined') {
            //split the space at the bearer
            const bearer = bearerHeader.split(' ');
            //Get token from string
            const bearerToken = bearer[1];

            jwt.verify(bearerToken, "groot", (err, decodedToken) => {
                if (err && err.message == "jwt expired") return res.status(401).send({ status: false, message: "Session expired! Please login again." })
                if (err) return res.status(401).send({ status: false, message: "Incorrect token" })
                //set the token
                req.token = decodedToken;
                //next middleweare
                next();
            })

        }else return res.status(401).send({status:false, message: "token must be present"})
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}
