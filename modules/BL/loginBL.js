const DAL = require('../DAL');
const config = require('../../config');
const sha512 = require('js-sha512');

const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    async getUserById(id) {
        const userFilter = { "_id": DAL.getObjectId(id) };

        return await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError);
    },

    async getUser(userAuth) {
        const userFilter = {
            $or: [
                { "username": userAuth.username },
                { "email": userAuth.username }
            ]
        }

        const user = await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError);

        // In case the auth details are wrong.
        if (!user || sha512(userAuth.password + user.salt) != user.password) {
            return false;
        }

        return user;
    },

    updateLastLogin: (userId) => {
        const findObj = { "_id": DAL.getObjectId(userId) };
        const lastLoginTimeObj = { $set: { "lastLoginTime": new Date() } };

        return DAL.updateOne(usersCollectionName, findObj, lastLoginTimeObj);
    }
};