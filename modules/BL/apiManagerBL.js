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

        projectFields = {
            _id: 1,
            matrix: 1,
            defaultSettings: 1
        };

        let project = await DAL.findOneSpecific(projectsCollectionName, projectFilter, projectFields)
            .catch(errorHandler.promiseError);

        if (project) {
            project.defaultSettings = project.defaultSettings || {};
            project.timeout = project.defaultSettings.timeout || config.requests.timeout;

            return { project, user };
        }
        else {
            return null;
        }
    }
};