const redis = require('redis');

let redisClient;

(async () => {
    redisClient = redis.createClient();

    redisClient.on("error", (error) => console.log(`Redis Error : ${error}`));
    redisClient.on("connect", () => console.log('Redis connected'));

    await redisClient.connect();
})();

module.exports = redisClient;