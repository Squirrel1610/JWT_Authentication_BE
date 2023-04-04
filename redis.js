const Redis = require("ioredis");
require("dotenv").config();

const redisClient = new Redis({
    port: process.env.REDIS_PORT, 
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
});

redisClient.on("connect", () => {
    console.log("Redis client connected");
});

redisClient.on('error', (err) => {
    console.log("Redis client occurs error: ");
    console.log(err);
    process.exit(1);
});

module.exports = redisClient;