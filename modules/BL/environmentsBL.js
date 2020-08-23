const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async addEnv(projectId, env, userId) {
        const envFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId),
            "environments.name": env.name
        };

        const envAmount = await DAL.count(projectsCollectionName, envFilter);

        if (envAmount > 0) {
            return "-1";
        }

        const projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) };
        const projectUpdate = { $push: { "environments": env } }

        const updateResult = DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate);

        return !!updateResult;
    }
};