const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    getProjects(ownerId) {
        return DAL.find(projectsCollectionName,
            { owner: DAL.getObjectId(ownerId) },
            { "date": 1 });
    },

    async addProject(name, ownerId) {
        if (await isProjectExists(name, ownerId)) {
            return false;
        }

        let project = {
            name,
            owner: DAL.getObjectId(ownerId),
            date: new Date()
        };

        let insertResult = await DAL.insert(projectsCollectionName, project)
            .catch(errorHandler.promiseError);

        project._id = insertResult;

        return project;
    },

    async editProject(projectId, name, ownerId) {
        if (await isProjectExists(name, ownerId)) {
            return false;
        }

        let projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(ownerId) };
        let projectUpdate = { $set: { name } }

        let updateResult = await DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);

        return updateResult ? { _id: projectId, name } : updateResult;
    },

    deleteProject(projectId) {
        return DAL.delete(projectsCollectionName,
            { _id: DAL.getObjectId(projectId) });
    },
};

async function isProjectExists(name, ownerId) {
    let filter = {
        name,
        owner: DAL.getObjectId(ownerId)
    };

    let count = await DAL.count(projectsCollectionName, filter)
        .catch(errorHandler.promiseError);

    return !!count;
}