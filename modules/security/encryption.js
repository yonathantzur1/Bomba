const crypto = require('crypto');
const config = require('../../config.js');
const logger = require('../../logger');

const algorithm = config.security.encrypt.algorithm;
const password = config.security.encrypt.secret;
const salt = config.security.encrypt.salt;
const key = crypto.scryptSync(password, salt, 24);

function handleError(err) {
    logger.warn(err);
    return null;
}

module.exports = {
    encrypt(text) {
        if (!validateInput(text)) {
            return null;
        }

        try {
            const iv = Buffer.alloc(16, 0);
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            const crypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

            return crypted;
        }
        catch (err) {
            return handleError(err);
        }
    },

    decrypt(text) {
        if (!validateInput(text)) {
            return null;
        }

        try {
            const iv = Buffer.alloc(16, 0);
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            const dec = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');

            return dec;
        }
        catch (err) {
            return handleError(err);
        }
    }
};

function validateInput(text) {
    return (text && typeof text == "string");
}