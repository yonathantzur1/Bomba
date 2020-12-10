const DAL = require('../DAL');
const config = require('../../config');
const mailer = require('../mailer');
const generator = require('../generator');
const sha512 = require('js-sha512');
const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    async addUser(newUser) {
        let result = { isValid: null, data: null };

        const isUsernameExists = await this.isUsernameExists(newUser.username)
            .catch(errorHandler.promiseError);

        if (isUsernameExists) {
            result.isValid = false;
            result.data = "-1";

            return result;
        }

        const isEmailExists = await this.isEmailExists(newUser.email)
            .catch(errorHandler.promiseError);

        if (isEmailExists) {
            result.isValid = false;
            result.data = "-2";

            return result;
        }

        const salt = generator.generateCode(config.security.password.saltSize);
        newUser.password = sha512(newUser.password + salt);

        let newUserObj = {
            "uid": generator.generateId(),
            "username": newUser.username,
            "email": newUser.email,
            "password": newUser.password,
            "salt": salt,
            "creationDate": new Date(),
            "isAdmin": false,
            "apiKey": generator.generateId(),
            "verification": {
                "code": generator.generateId(),
                "isVerified": false,
                "date": new Date()
            }
        };

        const insertResult = await DAL.insert(usersCollectionName, newUserObj)
            .catch(errorHandler.promiseError);

        newUserObj._id = insertResult;

        result.isValid = true;
        result.data = newUserObj;

        this.sendVerificationMail(newUser.email, newUser.username, newUserObj.verification.code);

        return result;
    },

    sendVerificationMail(email, username, verificationCode) {
        const verifyUrl = `${config.address.site}/verify/${verificationCode}`;
        mailer.verifyUser(email, username, verifyUrl);
    },

    isVerificationDateExpired(verificationDate) {
        const verificationDateTime = verificationDate.getTime();
        const verificationDateLimit = verificationDateTime + config.security.verification.timeout;
        const currDateTime = new Date().getTime();

        return (verificationDateLimit < currDateTime);
    },

    async isVerificationExpired(userFilter) {
        const userFields = { "verification": 1 };

        const user = await DAL.findOneSpecific(usersCollectionName, userFilter, userFields)
            .catch(errorHandler.promiseError);

        if (!user) {
            return false;
        }

        return this.isVerificationDateExpired(user.verification.date);
    },

    async verifyUser(verificationCode) {
        const userFilter = {
            "verification.code": verificationCode,
            "verification.isVerified": false
        }

        const isVerificationExpired = await this.isVerificationExpired(userFilter)
            .catch(errorHandler.promiseError);

        if (isVerificationExpired) {
            return false;
        }

        const userUpdate = {
            $set: {
                "verification.isVerified": true,
                "verification.date": new Date()
            }
        }

        const updateResult = await DAL.updateOne(usersCollectionName, userFilter, userUpdate)
            .catch(errorHandler.promiseError);

        return updateResult ? updateResult.username : false;
    },

    async getVerificationUserData(userUid) {
        const userFilter = {
            "uid": userUid,
            "verification.isVerified": false
        }

        const isVerificationExpired = await this.isVerificationExpired(userFilter)
            .catch(errorHandler.promiseError);

        if (isVerificationExpired) {
            return false;
        }

        const userFields = { "username": 1 };

        const user = await DAL.findOneSpecific(usersCollectionName, userFilter, userFields)
            .catch(errorHandler.promiseError);

        return user ? user.username : false;
    },

    async resendVerification(userUid) {
        const userFilter = {
            "uid": userUid,
            "verification.isVerified": false
        }

        const verificationCode = generator.generateId();
        const userUpdate = {
            $set: {
                "verification.code": verificationCode,
                "verification.date": new Date()
            }
        };

        const updateResult = await DAL.updateOne(usersCollectionName, userFilter, userUpdate)
            .catch(errorHandler.promiseError);

        if (updateResult) {
            this.sendVerificationMail(updateResult.email, updateResult.username, verificationCode);
        }

        return !!updateResult;
    },

    async isUsernameExists(username) {
        const userCount = await DAL.count(usersCollectionName, { username })
            .catch(errorHandler.promiseError);

        return !!userCount;
    },

    async isEmailExists(email) {
        const userCount = await DAL.count(usersCollectionName, { email })
            .catch(errorHandler.promiseError);

        return !!userCount;
    }
};