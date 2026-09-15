const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    try {

        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).send({
                message: "No token provided.",
                success: false
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!req.body) {
            req.body = {};
        }

        req.body.userId = decodedToken?.userId;
        next()

    } catch (error) {
        res.send(
            {
                message: error.message,
                success: false
            }
        )
    }
}