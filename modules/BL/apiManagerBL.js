const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async getApiKeyData(apiKey, projectName, envName) {
        const userFilter = { apiKey };

        const user = await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError);

        if (!user) {
            return null;
        }

        const projectFilter = { "name": projectName, "owner": user._id };

        const projectFields = {
            _id: 1,
            matrix: 1,
            defaultSettings: 1,
            environments: 1
        };

        let project = await DAL.findOneSpecific(projectsCollectionName, projectFilter, projectFields)
            .catch(errorHandler.promiseError);

        if (project) {
            project.defaultSettings = project.defaultSettings || {};
            project.timeout = project.defaultSettings.timeout || config.requests.timeout;

            if (envName) {
                project.env = project.environments.find(env => env.name == envName);

                if (!project.env) {
                    return null;
                }
            }

            delete project.environments;

            return { project, user };
        }
        else {
            return null;
        }
    }
};