const redis = require("redis");

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;
const client = redis.createClient(redisPort, redisHost); // Default host and port 127.0.0.1:6379

// Check connection
client.on("connect", function() {
    console.log("Redis client connected");
});

// Check for Errors
client.on("error", function(err) {
    console.log("Something went wrong " + err);
});

exports.client = client;