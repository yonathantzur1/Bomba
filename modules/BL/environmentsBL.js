const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async addEnv(projectId, env, userId) {
        env.name = env.name.trim();

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

        return !!updateResult;
    },

    updateEnv(projectId, currEnvName, env, userId) {
        env.name = env.name.trim();

        const envFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId),
            "environments.name": currEnvName
        };

        const envUpdate = { $set: { "environments.$": env } };

        return DAL.updateOne(projectsCollectionName, envFilter, envUpdate)
            .catch(errorHandler.promiseError);;
    },

    async deleteEnv(projectId, envName, userId) {
        const projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        const projectUpdate = { $pull: { "environments": { name: envName } } };

        const deleteResult = await DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);

        return !!deleteResult && deleteResult.environments.length > 0;
    }
};