const DAL = require('../DAL');
const config = require('../../config');

const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async getProjectBoard(projectId, userId) {
        projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        projectFields = {
            name: 1,
            matrix: 1,
            requests: 1,
            report: 1,
            defaultSettings: 1,
            environments: 1
        };

        let board = await DAL.findOneSpecific(projectsCollectionName, projectFilter, projectFields)
            .catch(errorHandler.promiseError);

        if (board) {
            board.maxRequestAmount = config.requests.max;
            board.defaultSettings = board.defaultSettings || {};
            board.defaultSettings.timeout = board.defaultSettings.timeout || config.requests.timeout;
        }

        return board;
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