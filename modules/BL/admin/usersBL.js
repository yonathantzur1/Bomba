const DAL = require('../../DAL');
const config = require('../../../config');
const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    getUser(searchInput) {
        // In case the input is empty, return empty result array.
        if (!searchInput) {
            return [];
        }

        try {
            searchInput = DAL.getObjectId(searchInput);
        }
        catch (e) {
            searchInput = searchInput.replace(/\\/g, '').trim();
        }

        let usersFilter = {
            $or: [
                { _id: searchInput },
                { username: new RegExp("^" + searchInput, 'g') }
            ]
        }

        let userFields = {
            "username": 1,
            "creationDate": 1,
            "isAdmin": 1
        }

        return DAL.findSpecific(usersCollectionName, usersFilter, userFields, { "username": 1 });
    }
}