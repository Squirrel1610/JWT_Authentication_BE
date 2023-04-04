require("dotenv").config();
const mongoose = require("mongoose");


class Database {
    constructor(){
        this.connectMongoDB();
    }

    async connectMongoDB(){
        try {
            await mongoose.connect(process.env.MONGO_DB_URL);

            console.log("MongoDB connect success");
        } catch (error) {
            console.log(error.message);
            console.log("MongoDB connect fail");
            process.exit(1);
        }
    }
}

module.exports = new Database();