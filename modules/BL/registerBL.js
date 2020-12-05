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

        // Creat the new user object.
        let newUserObj = {
            "uid": generator.generateId(),
            "username": newUser.username,
            "email": newUser.email,
            "password": newUser.password,
            "salt": salt,
            "creationDate": new Date(),
            "isAdmin": false,
            "apiKey": generator.generateId(),
            "verificationCode": generator.generateId()
        };

        let insertResult = await DAL.insert(usersCollectionName, newUserObj)
            .catch(errorHandler.promiseError);

        newUserObj._id = insertResult;

        result.isValid = true;
        result.data = newUserObj;

        this.sendVerificationMail(newUser.email, newUser.username, newUserObj.verificationCode);

        return result;
    },

    sendVerificationMail(email, username, verificationCode) {
        const verifyUrl = `${config.address.site}/verify/${verificationCode}`;
        mailer.verifyUser(email, username, verifyUrl);
    },

    async verifyUser(verificationCode) {
        const userFilter = { verificationCode };
        const userUpdate = { $unset: { verificationCode: "" } };

        const updateResult = await DAL.updateOne(usersCollectionName, userFilter, userUpdate)
            .catch(errorHandler.promiseError);

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