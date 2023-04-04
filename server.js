const express = require("express");
require("dotenv").config();

//connect db
require("./databases");


const app = express();

//middlewares setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//init router
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");

app.get("/api", (req, res, next) => {
    const health_check = {
        uptime: process.uptime(),
        message: "Index API",
        timestamp: Date.now(),
    };
    
    return res.status(200).json(health_check)
})

app.use("/api/auth/", authRouter);
app.use("/api/user/", userRouter);

const port = process.env.PORT || 5000;
app.listen(port , () => {
    console.log(`Server is listening on port ${port}`);
})