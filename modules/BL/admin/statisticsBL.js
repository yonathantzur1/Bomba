const DAL = require('../../DAL');
const config = require('../../../config');
const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async getStatistics() {
        let results = await Promise.all([this.getUsersCount(),
        this.getAdminsCount(),
        this.getProjectsCount()]).catch(errorHandler.promiseError);

        return {
            "users": results[0],
            "admins": results[1],
            "projects": results[2]
        }
    },

    getUsersCount() {
        return DAL.count(usersCollectionName, {})
            .catch(errorHandler.promiseError);
    },

    getAdminsCount() {
        return DAL.count(usersCollectionName, { "isAdmin": true })
            .catch(errorHandler.promiseError);
    },

    getProjectsCount() {
        return DAL.count(projectsCollectionName, {})
            .catch(errorHandler.promiseError);
    }
}