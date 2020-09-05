const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;
const reportsCollectionName = config.db.collections.reports;

module.exports = {
    getProjects(ownerId) {

        const filter = {
            $match: { owner: DAL.getObjectId(ownerId) }
        }

        const projectFields = {
            $project: {
                "name": 1,
                "date": 1,
                "isSendMode": { $cond: [{ $eq: ["$report", "$null"] }, false, true] },
                "isSendDone": "$report.isDone"
            }
        }

        const sortObj = { $sort: { "date": 1 } };

        const aggregateArray = [filter, projectFields, sortObj];

        return DAL.aggregate(projectsCollectionName, aggregateArray);
    },

    getProjectsForApi(ownerId) {
        const filter = { "owner": DAL.getObjectId(ownerId) }
        const projectFields = { "name": 1, "environments.name": 1 }
        const sortObj = { "date": 1 };

        return DAL.findSpecific(projectsCollectionName, filter, projectFields, sortObj);
    },

    async addProject(name, ownerId) {
        const isExists = await isProjectExists(name, ownerId)
            .catch(errorHandler.promiseError);

        if (isExists) {
            return false;
        }

        const project = {
            name,
            owner: DAL.getObjectId(ownerId),
            date: new Date(),
            matrix: null,
            requests: null,
            environments: []
        };

        const insertResult = await DAL.insert(projectsCollectionName, project)
            .catch(errorHandler.promiseError);

        project._id = insertResult;

        return project;
    },

    async editProject(projectId, name, ownerId) {
        const isExists = await isProjectExists(name, ownerId)
            .catch(errorHandler.promiseError);

        if (isExists) {
            return false;
        }

        const projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(ownerId) };
        const projectUpdate = { $set: { name } }

        const updateResult = await DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);

        return updateResult ? { _id: projectId, name } : updateResult;
    },

    async deleteProject(projectId, userId) {
        const projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) };

        const deleteProject = await DAL.delete(projectsCollectionName, projectFilter)
            .catch(errorHandler.promiseError);

        if (deleteProject) {
            let reportFilter = { projectId: DAL.getObjectId(projectId) };

            DAL.delete(reportsCollectionName, reportFilter)
                .catch(errorHandler.promiseError);
        }

        return deleteProject;
    },

    saveRequestSettings(projectId, defaultSettings, ownerId) {
        const projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(ownerId) };
        const projectUpdate = { $set: { defaultSettings } }

        return DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate);
    }
};

async function isProjectExists(name, ownerId) {
    const filter = {
        name,
        owner: DAL.getObjectId(ownerId)
    };

    const count = await DAL.count(projectsCollectionName, filter)
        .catch(errorHandler.promiseError);

    return !!count;
}