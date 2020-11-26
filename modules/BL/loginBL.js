const DAL = require('../DAL');
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

    async getUser(userAuth) {
        let user = await DAL.findOne(usersCollectionName,
            {
                $or: [
                    { "username": userAuth.username },
                    { "email": userAuth.username }
                ]
            })
            .catch(errorHandler.promiseError);

        // In case the auth details are wrong.
        if (!user || sha512(userAuth.password + user.salt) != user.password) {
            return false;
        }
        else {
            return user;
        }
    },

    updateLastLogin: (userId) => {
        let findObj = { "_id": DAL.getObjectId(userId) };
        let lastLoginTimeObj = { $set: { "lastLoginTime": new Date() } };

        return DAL.updateOne(usersCollectionName, findObj, lastLoginTimeObj)
            .catch(errorHandler.promiseError);
    }
};