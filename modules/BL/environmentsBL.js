const DAL = require('../DAL');
const config = require('../../config');
const generator = require('../generator');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;
const reportsCollectionName = config.db.collections.reports;

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
            return { result: "-1" };
        }

        const projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) };
        const projectUpdate = { $push: { "environments": env } }

        const updateResult = DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);

        return { result: !!updateResult ? env.id : false };
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

    async deleteEnv(projectId, envId, userId) {
        const projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        const projectUpdate = { $pull: { "environments": { id: envId } } };

        const deleteEnvResult = await DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);

        if (!deleteEnvResult) {
            return false;
        }

        const reportsFilter = {
            projectId: DAL.getObjectId(projectId),
            environmentId: envId
        };

        const reportUpdate = { $set: { "environmentId": null } };

        DAL.updateOne(reportsCollectionName, reportsFilter, reportUpdate)
            .catch(errorHandler.promiseError);

        return true;
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