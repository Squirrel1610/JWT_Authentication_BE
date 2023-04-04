const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/dashboard", authMiddleware.verifyAccessToken, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Hello from dashboard"
    })
})

module.exports = router;