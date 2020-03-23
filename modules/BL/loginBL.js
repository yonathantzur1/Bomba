const DAL = require('../DAL');
const registerBL = require('./registerBL');
const config = require('../../config');
const sha512 = require('js-sha512');

const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    async getUserById(id) {
        let userFilter = { "_id": DAL.getObjectId(id) };

        return await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError);
    },

    isAdminUser(userAuth) {
        let adminAuth = config.security.admin;

        return (userAuth.username == adminAuth.username &&
            userAuth.password == adminAuth.password);
    },

    async getUser(userAuth) {
        let user = await DAL.findOne(usersCollectionName, { "username": userAuth.username })
            .catch(errorHandler.promiseError);

        if (this.isAdminUser(userAuth)) {
            if (!user) {
                user = await registerBL.addUser(userAuth, true);
            }
        }
        else {
            // In case the username was not found.
            if (!user) {
                return "-1";
            }
            // In case the password is wrong.
            else if (sha512(userAuth.password + user.salt) != user.password) {
                return false;
            }
        }

        return user;
    },

    updateLastLogin: (userId) => {
        let findObj = { "_id": DAL.getObjectId(userId) };
        let lastLoginTimeObj = { $set: { "lastLoginTime": new Date() } };

        return DAL.updateOne(usersCollectionName, findObj, lastLoginTimeObj);
    }
};