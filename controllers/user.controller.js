const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const redisClient = require("../redis");
require("dotenv").config();

async function createAccessToken(userId) {
    try {
        const accessToken = await jwt.sign({userId}, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_TIME
        })

        return accessToken;
    } catch (error) {
        throw new Error(error);
    }

}

async function createRefreshToken(userId) {
    try {
        const refreshToken = await jwt.sign({userId}, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_TIME
        })

        return refreshToken;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    register: async (req, res) => {
        const { username, password } = req.body;

        try {
            //check username has been in database
            let userExist = await UserModel.findOne({username});
            
            if(userExist) {
                return res.status(400).json({
                    success: false,
                    message: "This username has been used"
                })
            }

            //hash password
            const salt = await bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hashSync(password, salt);

            const user = new UserModel({
                username,
                password: hashedPassword
            })

            const result = await user.save();
            
            return res.status(200).json({
                success: true,
                message: "Register success",
                data: result
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }
    },

    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            let user = await UserModel.findOne({username});
            if(user == null) {
                return res.status(400).json({
                    success: false,
                    message: "Username or password incorrect"
                })
            }

            // //check password
            // const salt = await bcrypt.genSaltSync(10);
            // const hashedPassword = await bcrypt.hashSync(password, salt);
            const isMatched = await bcrypt.compareSync(password, user.password);
            
            if(!isMatched){
                return res.status(400).json({
                    success: false,
                    message: "Username or password incorrect"
                })
            }

            //generate access and refresh token then store refresh token in redis
            const userId = user._id;
            const accessToken = await createAccessToken(userId);
            const refreshToken = await createRefreshToken(userId);
            await redisClient.set(userId.toString(), JSON.stringify({ token: refreshToken }));

            return res.status(200).json({
                success: true,
                message:"Login success",
                accessToken
            })
            
        } catch (error) {
            console.log(error.message);
            return res.status(400).json({
                success: false,
                message: "Failed to login"
            })
        }
    },

    //get new access token
    renewAccessToken: async (req, res) => {
        //verify refresh token (The code here may be change because it not secure)
        const { token } = req.body;
        if(!token ) {
            return res.status(400).json({
                success: false,
                message: "Missing token to get new access token"
            })
        }

        try {
            const {userId} = await jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            
            //check whether redis has stored this user with refresh token yet?
            const storedToken = await redisClient.get(userId);
            if(storedToken && (JSON.parse(storedToken).token == token)) {
                const accessToken = await createAccessToken(userId);
                const refreshToken = await createRefreshToken(userId);
                await redisClient.set(userId.toString(), JSON.stringify({ token: refreshToken }));

                return res.status(200).json({
                    success: true,
                    message: "Get new access token success",
                    accessToken
                })
            } else {
                return res.status(401).json({
                    scuccess: false,
                    message: "Token is not stored in redis"
                })
            }
        } catch (error) {
            console.log(error.message);
            return res.status(400).json({
                success: false, 
                message: "Failed to get new access token"
            })
        }
    },

    logout: async (req, res) => {
        const userId = req.user.userId;
        const accessToken = req.token;

        try {
            //clear refresh token store in redis
            await redisClient.del(userId.toString());

            //add this access token to black list
            await redisClient.set("BL_" + userId.toString(), accessToken);

            return res.status(200).json({
                success: true,
                message: "Logout success"
            })
        } catch (error) {
            console.log(error.message);
            return res.status(400).json({
                success: false,
                message: "Failed to log out"
            })
        }
        
    }
}
