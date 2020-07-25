const DAL = require('../DAL');
const config = require('../../config');

const errorHandler = require('../handlers/errorHandler');

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
                    "time": 0,
                    "isStart": false
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

        return DAL.updateOne(projectsCollectionName, projectFilter, { $set: { "report": setReport } })
            .catch(errorHandler.promiseError);
    },

    updateRequestStart(projectId, requestId) {
        // Update only if report exists in document.
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            report: { $ne: null }
        }

        let jsonStr = '{ "$set": { "' + "report.results." + requestId + '.isStart": true } }';
        let updateObj = JSON.parse(jsonStr);

        return DAL.updateOne(projectsCollectionName, projectFilter, updateObj)
            .catch(errorHandler.promiseError);
    },

    updateRequestStatus(requestStatus) {
        // Update only if report exists in document.
        let projectFilter = {
            _id: DAL.getObjectId(requestStatus.projectId),
            report: { $ne: null }
        }

        let jsonStr = '{ "$set": { "report.results.' + requestStatus.requestId + '.success": ' + requestStatus.success +
            ', "report.results.' + requestStatus.requestId + '.fail": ' + requestStatus.fail +
            ', "report.results.' + requestStatus.requestId + '.time": ' + requestStatus.time + ' } }';
        let updateObj = JSON.parse(jsonStr);

        return DAL.updateOne(projectsCollectionName, projectFilter, updateObj)
            .catch(errorHandler.promiseError);
    },

    finishReport(projectId) {
        // Update only if report exists in document.
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            report: { $ne: null }
        }

        let updateObj = {
            $set: { "report.isDone": true }
        };

        DAL.updateOne(projectsCollectionName, projectFilter, updateObj)
            .catch(errorHandler.promiseError);
    },

    async saveReport(projectId, totalTime) {
        let projectFilter = {
            _id: DAL.getObjectId(projectId)
        }

        let projectFields = { "_id": 1, "matrix": 1, "report": 1 };

        let projectQueryResult = await DAL.findOneSpecific(projectsCollectionName, projectFilter, projectFields)
            .catch(errorHandler.promiseError);

        let report = {
            "projectId": DAL.getObjectId(projectQueryResult._id),
            "date": projectQueryResult.report.creationDate,
            "success": 0,
            "fail": 0,
            "totalTime": totalTime,
            "longestTime": 0
        };

        let results = projectQueryResult.report.results;

        let requestsTotalTime = 0
        let totalRequests = 0;

        Object.keys(results).forEach(requestId => {
            let result = results[requestId];

            report.success += result.success;
            report.fail += result.fail;
            totalRequests += result.success + result.fail;
            requestsTotalTime += result.time;

            let requestsAvgTime = result.time / (result.success + result.fail);

            if (requestsAvgTime > report.longestTime) {
                report.longestTime = requestsAvgTime;
            }
        });

        report.requestAverageTime = requestsTotalTime / totalRequests; // seconds

        report.data = {
            "matrix": projectQueryResult.matrix,
            "results": projectQueryResult.report.results
        }

        DAL.insert(reportsCollectionName, report).catch(errorHandler.promiseError);
    },


    removeProjectReport(projectId, userId) {
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        return DAL.updateOne(projectsCollectionName, projectFilter, { $unset: { "report": "" } })
            .catch(errorHandler.promiseError);
    },

    getAllReports(userId) {
        let reportFilter = {
            $match: { "project.owner": DAL.getObjectId(userId) }
        }

        let joinFilter = {
            $lookup:
            {
                from: projectsCollectionName,
                localField: 'projectId',
                foreignField: '_id',
                as: 'project'
            }
        };

        let unwindObject = {
            $unwind: {
                path: "$project"
            }
        };

        let group = {
            $group: {
                _id: {
                    "projectId": "$projectId",
                    "projectName": "$project.name"
                },
                count: { $sum: 1 }
            }
        }

        let fields = {
            $project: {
                "_id": 0,
                "projectId": "$_id.projectId",
                "projectName": "$_id.projectName",
                "reportsAmount": "$count"
            }
        };

        let sort = {
            $sort: { "projectName": 1 }
        }

        let aggregateArray = [joinFilter, unwindObject, reportFilter, group, fields, sort];

        return DAL.aggregate(reportsCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);
    },

    getProjectReports(projectId, userId) {
        let reportFilter = {
            $match: {
                "projectId": DAL.getObjectId(projectId)
            }
        }

        let joinFilter = {
            $lookup:
            {
                from: projectsCollectionName,
                localField: 'projectId',
                foreignField: '_id',
                as: 'project'
            }
        }

        let reportOwnerFilter = {
            $match: {
                "project.owner": DAL.getObjectId(userId)
            }
        }

        let fields = {
            $project: {
                "project": 0,
                "data": 0
            }
        };

        let sort = {
            $sort: { "date": -1 }
        }

        let aggregateArray = [reportFilter, joinFilter, reportOwnerFilter, fields, sort];

        return DAL.aggregate(reportsCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);
    },

    async getReportData(reportId, userId) {
        let reportFilter = {
            $match: {
                "_id": DAL.getObjectId(reportId)
            }
        }

        let joinFilter = {
            $lookup:
            {
                from: projectsCollectionName,
                localField: 'projectId',
                foreignField: '_id',
                as: 'project'
            }
        }

        let reportOwnerFilter = {
            $match: {
                "project.owner": DAL.getObjectId(userId)
            }
        }

        let fields = {
            $project: {
                "data": 1
            }
        };

        let aggregateArray = [reportFilter, joinFilter, reportOwnerFilter, fields];

        let reportData = await DAL.aggregate(reportsCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

        return (reportData.length == 1) ? reportData[0] : null;
    },

    async deleteReport(projectId, reportId, userId) {
        let projectFilter = {
            "_id": DAL.getObjectId(projectId),
            "owner": DAL.getObjectId(userId)
        }

        let projectCount = await DAL.count(projectsCollectionName, projectFilter)
            .catch(errorHandler.promiseError);

        if (projectCount < 1) {
            return false;
        }

        let reportFilter = {
            "_id": DAL.getObjectId(reportId),
            "projectId": DAL.getObjectId(projectId)
        }

        return DAL.deleteOne(reportsCollectionName, reportFilter)
            .catch(errorHandler.promiseError);
    }
}