const DAL = require('../DAL');
const config = require('../../config');
const mailer = require('../mailer');
const generator = require('../generator');
const sha512 = require('js-sha512');

const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    // Add user to the DB.
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
            "apiKey": generator.generateId()
        };

        let insertResult = await DAL.insert(usersCollectionName, newUserObj)
            .catch(errorHandler.promiseError);

        newUserObj._id = insertResult;

        result.isValid = true;
        result.data = newUserObj;

        mailer.registerMail(newUser.email, newUser.username);

        return result;
    },

    async isUsernameExists(username) {
        let userCount = await DAL.count(usersCollectionName, { username })
            .catch(errorHandler.promiseError);

        return !!userCount;
    },

    async isEmailExists(email) {
        let userCount = await DAL.count(usersCollectionName, { email })
            .catch(errorHandler.promiseError);

        return !!userCount;
    }
};