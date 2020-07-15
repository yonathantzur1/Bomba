const DAL = require('../DAL');
const config = require('../../config');
const generator = require('../generator');
const sha512 = require('js-sha512');

const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    // Add user to the DB.
    async addUser(newUser) {
        const isExists = await this.isUserExists(newUser.username)
            .catch(errorHandler.promiseError);

        if (isExists) {
            return false;
        }

        const salt = generator.generateCode(config.security.password.saltSize);
        newUser.password = sha512(newUser.password + salt);

        // Creat the new user object.
        let newUserObj = {
            "uid": generator.generateId(),
            "username": newUser.username,
            "password": newUser.password,
            "salt": salt,
            "creationDate": new Date(),
            "isAdmin": false,
            "apiKey": generator.generateId()
        };

        let insertResult = await DAL.insert(usersCollectionName, newUserObj)
            .catch(errorHandler.promiseError);

        newUserObj._id = insertResult;

        return newUserObj;
    },

    async isUserExists(username) {
        let userCount = await DAL.count(usersCollectionName, { username })
            .catch(errorHandler.promiseError);

        return !!userCount;
    }
};