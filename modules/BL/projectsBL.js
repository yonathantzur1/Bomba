const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;
const reportsCollectionName = config.db.collections.reports;

module.exports = {
    getProjects(ownerId) {

        let filter = {
            $match: { owner: DAL.getObjectId(ownerId) }
        }

        let projectFields = {
            $project: {
                "name": 1,
                "date": 1,
                "isSendMode": { $cond: [{ $eq: ["$report", "$null"] }, false, true] },
                "isSendDone": "$report.isDone"
            }
        }

        let sortObj = { $sort: { "date": 1 } };

        let aggregateArray = [filter, projectFields, sortObj];

        return DAL.aggregate(projectsCollectionName, aggregateArray);
    },

    getProjectsNames(ownerId) {
        let filter = { "owner": DAL.getObjectId(ownerId) }
        let projectFields = { "name": 1 }
        let sortObj = { "date": 1 };

        return DAL.findSpecific(projectsCollectionName, filter, projectFields, sortObj);
    },

    async addProject(name, ownerId) {
        let isExists = await isProjectExists(name, ownerId)
            .catch(errorHandler.promiseError);

        if (isExists) {
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
        let isExists = await isProjectExists(name, ownerId)
            .catch(errorHandler.promiseError);

        if (isExists) {
            return false;
        }

        let projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(ownerId) };
        let projectUpdate = { $set: { name } }

        let updateResult = await DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate)
            .catch(errorHandler.promiseError);

        return updateResult ? { _id: projectId, name } : updateResult;
    },

    async deleteProject(projectId, userId) {
        let projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(userId) };

        let deleteProject = await DAL.delete(projectsCollectionName, projectFilter)
            .catch(errorHandler.promiseError);

        if (deleteProject) {
            let reportFilter = { projectId: DAL.getObjectId(projectId) };

            DAL.delete(reportsCollectionName, reportFilter)
                .catch(errorHandler.promiseError);
        }

        return deleteProject;
    },

    saveRequestSettings(projectId, defaultSettings, ownerId) {
        let projectFilter = { _id: DAL.getObjectId(projectId), owner: DAL.getObjectId(ownerId) };
        let projectUpdate = { $set: { defaultSettings } }

        return DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate);
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