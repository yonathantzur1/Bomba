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

        return DAL.updateOne(projectsCollectionName, projectFilter, { $set: { "report": setReport } });
    },

    updateRequestStart(projectId, requestId) {
        // Update only if report exists in document.
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            report: { $ne: null }
        }

        let jsonStr = '{ "$set": { "' + "report.results." + requestId + '.isStart": true } }';
        let updateObj = JSON.parse(jsonStr);

        return DAL.updateOne(projectsCollectionName, projectFilter, updateObj);
    },

    updateRequestResult(projectId, requestId, state, time) {
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

    finishReport(projectId) {
        // Update only if report exists in document.
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            report: { $ne: null }
        }

        let updateObj = {
            $set: { "report.isDone": true }
        };

        DAL.updateOne(projectsCollectionName, projectFilter, updateObj);
    },

    async saveReport(projectId, totalTime) {
        let projectFilter = {
            _id: DAL.getObjectId(projectId)
        }

        let projectFields = { "report": 1 };

        let queryResult = await DAL.findOneSpecific(projectsCollectionName, projectFilter, projectFields);

        let report = {
            "projectId": DAL.getObjectId(queryResult._id),
            "date": queryResult.report.creationDate,
            "success": 0,
            "fail": 0,
            "totalTime": totalTime // seconds
        };

        let results = queryResult.report.results;

        let requestsTotalAvgTime = 0
        let totalRequests = 0;

        Object.keys(results).forEach(requestId => {
            let result = results[requestId];

            report.success += result.success;
            report.fail += result.fail;
            totalRequests += result.success + result.fail;
            requestsTotalAvgTime += result.time;
        });

        report.requestAverageTime = requestsTotalAvgTime / totalRequests; // seconds

        DAL.insert(reportsCollectionName, report);
    },


    removeReport(projectId, userId) {
        let projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        };

        return DAL.updateOne(projectsCollectionName, projectFilter, { $unset: { "report": "" } });
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

        return DAL.aggregate(reportsCollectionName, aggregateArray);
    },

    async getProjectReports(projectId, userId) {
        let reportFilter = {
            $match: {
                "projectId": DAL.getObjectId(projectId),
                "project.owner": DAL.getObjectId(userId)
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

        let fields = {
            $project: {
                "project": 0
            }
        };

        let sort = {
            $sort: { "date": -1 }
        }

        let aggregateArray = [joinFilter, reportFilter, fields, sort];

        return DAL.aggregate(reportsCollectionName, aggregateArray);
    }
}