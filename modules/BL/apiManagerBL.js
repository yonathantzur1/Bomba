const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async getApiKeyData(apiKey, projectName) {
        let userFilter = { apiKey };

        let user = await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError);

        if (!user) {
            return null;
        }

        let projectFilter = { "name": projectName, "owner": user._id };

        let project = await DAL.findOne(projectsCollectionName, projectFilter)
            .catch(errorHandler.promiseError);

        if (!project) {
            return null;
        }

        return { project, user };
    }
};