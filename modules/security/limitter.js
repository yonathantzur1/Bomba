const config = require('../../config');
const rateLimit = require("express-rate-limit");

const waitTime = config.security.limitter.waitTime;
const freeRetries = config.security.limitter.freeRetries;

module.exports = rateLimit({
    windowMs: waitTime,
    max: freeRetries,
    keyGenerator: req => {
        let key = req.ip.concat(";", req.url, ";");

        if (req.limitterKey) {
            key += req.limitterKey   
        }

        return key;
    },
    handler: (req, res, next) => {
        res.send({ "result": { "lock": Math.ceil(waitTime / 60000) } });
    }
});