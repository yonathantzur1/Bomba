const logger = require("./../logger");
const config = require("./../config");

module.exports = () => {
    const redisConnectionString = config.redis.connectionString;

    if (!redisConnectionString || !config.server.isProd) {
        return null;
    }

    const Redis = require("ioredis");
    const redis = new Redis(redisConnectionString);
    const pub = new Redis(redisConnectionString);

    let pubsub = {
        channels: {
            stopRequests: "stopRequests"
        },

        async subscribe(channel) {
            redis.subscribe(channel, (err, count) => {
                if (err) {
                    logger.error(err);
                    return false;
                }
                else {
                    return true;
                }
            });
        },

        publish(channel, message) {
            pub.publish(channel, message);
        },

        onMessage(callback) {
            redis.on("message", (channel, message) => {
                callback(channel, message);
            });
        }
    }

    return pubsub;
}