const logger = require("./../logger");
const config = require("./../config");
const Redis = require("ioredis");

const redisConnectionString = config.redis.connectionString;
const redis;
const pub;

if (redisConnectionString && config.server.isProd) {
    redis = new Redis(redisConnectionString);
    pub = new Redis(redisConnectionString);
}

module.exports = () => {
    if (!redis || !pub) {
        return null;
    }

    let pubsub = {
        channels: {
            stopRequests: "stopRequests"
        },

        subscribe(channel) {
            return new Promise((resolve, reject) => {
                redis.subscribe(channel, (err, count) => {
                    if (err) {
                        logger.error(err);
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                });
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