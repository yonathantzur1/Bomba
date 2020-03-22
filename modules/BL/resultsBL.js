const DAL = require('../DAL');
const config = require('../../config');

const resultsCollectionName = config.db.collections.results;

module.exports = {
    async initResults(matrix, projectId, userId) {
        let results = {};

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                results[matrix[i][j].id] = {
                    "success": 0,
                    "fail": 0,
                    "time": 0
                }
            }
        }

        let resultsDoc = {
            projectId: DAL.getObjectId(projectId),
            userId: DAL.getObjectId(userId),
            results
        }

        await this.removeResults(projectId, userId);

        return DAL.insert(resultsCollectionName, resultsDoc);
    },

    async getResults(projectId, userId) {
        let resultsFilter = {
            projectId: DAL.getObjectId(projectId),
            userId: DAL.getObjectId(userId)
        };

        let fields = { "results": 1 };

        let data = await DAL.findOneSpecific(resultsCollectionName, resultsFilter, fields);

        return data ? data.results : null;
    },

    updateResult(resultId, requestId, state, time) {
        let resultsFilter = {
            _id: DAL.getObjectId(resultId),
        };

        let jsonStr = '{ "$inc": { "' + "results." + requestId + "." + state + '": 1,' +
            ' "results.' + requestId + '.time": ' + time + ' } }';
        let updateObj = JSON.parse(jsonStr);

        return DAL.updateOne(resultsCollectionName, resultsFilter, updateObj);
    },

    removeResults(projectId, userId) {
        return DAL.deleteOne(resultsCollectionName, {
            projectId: DAL.getObjectId(projectId),
            userId: DAL.getObjectId(userId)
        });
    }
}