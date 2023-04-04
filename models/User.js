const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            require: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("User", UserSchema);