const DAL = require('../DAL');
const config = require('../../config');
const generator = require('../generator');
const sha512 = require('js-sha512');

const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    // Add user to the DB.
    async addUser(newUser, isAdmin) {
        if (await isUserExists(newUser.username) && !isAdmin) {
            return false;
        }

        let salt = generator.generateCode(config.security.password.saltSize);
        newUser.password = sha512(newUser.password + salt);

        // Creat the new user object.
        let newUserObj = {
            "uid": generator.generateId(),
            "username": newUser.username,
            "password": newUser.password,
            "salt": salt,
            "creationDate": new Date(),
            "isAdmin": !!isAdmin
        };

        let insertResult = await DAL.insert(usersCollectionName, newUserObj)
            .catch(errorHandler.promiseError);

        newUserObj._id = insertResult;

        return newUserObj;
    }
};

async function isUserExists(username) {
    if (username == config.security.admin.username) {
        return true;
    }

    let userCount = await DAL.count(usersCollectionName, { username })
        .catch(errorHandler.promiseError);

    return !!userCount;
}