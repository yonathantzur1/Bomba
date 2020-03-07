const DAL = require('../../DAL');
const config = require('../../../config');
const sha512 = require('js-sha512');

const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    async getUser(userAuth) {
        let userFilter = { "username": userAuth.username };

        let user = await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError);

        // In case the username was not found.
        if (!user) {
            return "-1";
        }
        // In case the password is wrong.
        else if (sha512(userAuth.password + user.salt) != user.password) {
            return false;
        }
        else {
            return user;
        }
    },

    updateLastLogin: (userId) => {
        let findObj = { "_id": DAL.getObjectId(userId) };
        let lastLoginTimeObj = { $set: { "lastLoginTime": new Date() } };

        return DAL.updateOne(usersCollectionName, findObj, lastLoginTimeObj);
    }
};