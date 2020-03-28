const DAL = require('../DAL');
const config = require('../../config');

const reportsCollectionName = config.db.collections.reports;
const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async initReport(matrix, projectId, userId) {
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

        let setReport = {
            creationDate: new Date(),
            results
        }

        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        }

        return DAL.updateOne(projectsCollectionName, projectFilter, { $set: { "report": setReport } });
    },

    updateReportResult(projectId, requestId, state, time) {
        // Update only if report exists in document.
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            report: { $ne: null }
        }

        let jsonStr = '{ "$inc": { "' + "report.results." + requestId + "." + state + '": 1,' +
            ' "report.results.' + requestId + '.time": ' + time + ' } }';
        let updateObj = JSON.parse(jsonStr);

        return DAL.updateOne(projectsCollectionName, projectFilter, updateObj);
    },

    removeReport(projectId, userId) {
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        return DAL.updateOne(projectsCollectionName, projectFilter, { $unset: { "report": "" } });
    },

    async saveReport(projectId, userId) {
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        }

        let projectFields = { "report": 1 };

        let queryResult = await DAL.findOneSpecific(projectsCollectionName, projectFilter, projectFields);

        let report = {
            "projectId": DAL.getObjectId(queryResult._id),
            "date": queryResult.report.creationDate,
            "success": 0,
            "fail": 0,
            "total": 0,
            "totalTime": 0, // seconds
            "requestAverageTime": 0 // seconds
        };

        let results = queryResult.report.results;

        Object.keys(results).forEach(requestId => {
            let result = results[requestId];

            report.success += result.success;
            report.fail += result.fail;
            report.total += result.success + result.fail;
            report.totalTime += result.time;
        });

        report.requestAverageTime = report.totalTime / report.total;

        let resultId = await DAL.insert(reportsCollectionName, report);

        return resultId ? true : false;
    }
}