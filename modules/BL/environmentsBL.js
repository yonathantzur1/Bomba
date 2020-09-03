const DAL = require('../DAL');
const config = require('../../config');
const generator = require('../generator');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async addEnv(projectId, env, userId) {
        env.name = env.name.trim();
        env.id = generator.generateId();

        const envFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId),
            "environments.name": env.name
        };

        const envAmount = await DAL.count(projectsCollectionName, envFilter)
            .catch(errorHandler.promiseError);

        if (envAmount > 0) {
            return "-1";
        }

        const projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) };
        const projectUpdate = { $push: { "environments": env } }

        const updateResult = DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);

        return !!updateResult ? env.id : false;
    },

    updateEnv(projectId, currEnvName, env, userId) {
        env.name = env.name.trim();

        const projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId),
            "environments.name": currEnvName
        };

        const envUpdate = { $set: { "environments.$": env } };

        return DAL.updateOne(projectsCollectionName, projectFilter, envUpdate)
            .catch(errorHandler.promiseError);;
    },

    deleteEnv(projectId, envName, userId) {
        const projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        const projectUpdate = { $pull: { "environments": { name: envName } } };

        return DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);
    },

    async updateActiveEnv(projectId, envName, userId) {
        const oldEnvFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId),
            "environments.isActive": true
        };

        const oldEnvUpdate = { $set: { "environments.$.isActive": false } };

        await DAL.updateOne(projectsCollectionName, oldEnvFilter, oldEnvUpdate)
            .catch(errorHandler.promiseError);

        // In case the user select "no environment"
        if (!envName) {
            return true;
        }

        const newEnvFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId),
            "environments.name": envName
        };

        const newEnvUpdate = { $set: { "environments.$.isActive": true } };

        const result = await DAL.updateOne(projectsCollectionName, newEnvFilter, newEnvUpdate)
            .catch(errorHandler.promiseError);

        return result.environments.length > 0;
    }
};