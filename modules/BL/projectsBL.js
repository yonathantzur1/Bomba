const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;
const reportsCollectionName = config.db.collections.reports;

module.exports = {
    getProjects(ownerId) {
        projectFields = {
            "name": 1,
            "date": 1
        }

        return DAL.findSpecific(projectsCollectionName,
            { owner: DAL.getObjectId(ownerId) },
            projectFields,
            { "date": 1 });
    },

    async addProject(name, ownerId) {
        if (await isProjectExists(name, ownerId)) {
            return false;
        }

        let project = {
            name,
            owner: DAL.getObjectId(ownerId),
            date: new Date(),
            matrix: null,
            requests: null
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

    async deleteProject(projectId, userId) {
        let deleteProject = await DAL.delete(projectsCollectionName,
            { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) });

        if (deleteProject) {
            DAL.delete(reportsCollectionName,
                { projectId: DAL.getObjectId(projectId) });
        }

        return deleteProject;
    },

    saveRequestSettings(projectId, defaultSettings, ownerId) {
        let projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(ownerId) };
        let projectUpdate = { $set: { defaultSettings } }

        return DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);
    }
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