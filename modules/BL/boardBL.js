const DAL = require('../DAL');
const config = require('../../config');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    getProjectBoard(projectId, userId) {
        projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        projectFields = {
            name: 1,
            matrix: 1,
            requests: 1,
            report: 1,
            defaultSettings: 1
        };

        return DAL.findOneSpecific(projectsCollectionName, projectFilter, projectFields);
    },

    saveMatrix(projectId, userId, matrix) {
        projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        projectUpdate = {
            $set: { matrix }
        };

        return DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate);
    },

    saveRequests(projectId, userId, requests) {
        projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        projectUpdate = {
            $set: { requests }
        };

        return DAL.updateOne(projectsCollectionName, projectFilter, projectUpdate);
    }
};