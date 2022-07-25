
const jwt = require("jsonwebtoken");

//===================================================[API:FOR AUTHENTICATION]===========================================================
exports.authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"] || req.headers["X-API-KEY"]
        if (!token) {
            return res.status(401).send({ status: false, message: "token must be present" })
        }
        jwt.verify(token, "groot", (err, decodedToken) => {
            if (err && err.message == "jwt expired") return res.status(401).send({ status: false, message: "Session expired! Please login again." })
            if (err) return res.status(401).send({ status: false, message: "Incorrect token" })
            req.token = decodedToken
            next()
        })
        next();
    }
    catch (err) { return res.status(500).send({ status: false, message: err.message }); }
}
