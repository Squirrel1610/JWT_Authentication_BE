const jwt = require("jsonwebtoken");
const redisClient = require("../redis");

module.exports = {
    verifyAccessToken: async (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1];
            if(!token) {
                return res.status(401).json({
                    success: false,
                    message: "Missing access token in headers"
                })
            }

            const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            //check token is in blacklist
            const blacklistToken = await redisClient.get("BL_" + decoded.userId.toString());
            if(blacklistToken && blacklistToken == token) {
                return res.status(401).json({
                    success: false,
                    message: "This token is in blacklist"
                })
            }

            req.user = decoded;
            req.token = token;
            next();
        } catch (error) {
            console.log(error.message);
            return res.status(401).json({
                success: false,
                message: "Failed to verify access token"
            })
        }
    }
}