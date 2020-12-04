const DAL = require('../DAL');
const config = require('../../config');

const errorHandler = require('../handlers/errorHandler');

const reportsCollectionName = config.db.collections.reports;
const projectsCollectionName = config.db.collections.projects;

module.exports = {

    async setReportName(reportId, projectId, name, userId) {
        const projectFilter = {
            "_id": DAL.getObjectId(projectId),
            "owner": DAL.getObjectId(userId)
        }

        const projectCount = await DAL.count(projectsCollectionName, projectFilter)
            .catch(errorHandler.promiseError);

        if (projectCount != 1) {
            return false;
        }

        const reportFilter = {
            "_id": DAL.getObjectId(reportId),
            "projectId": DAL.getObjectId(projectId)
        }

        let updateObj;

        if (name) {
            updateObj = { $set: { name } }
        }
        else {
            updateObj = { $unset: { name: "" } }
        }

        return DAL.updateOne(reportsCollectionName, reportFilter, updateObj);
    },

    async initReport(matrix, projectId, userId) {
        let results = {}

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                results[matrix[i][j].id] = {
                    "success": 0,
                    "fail": 0,
                    "timeout": 0,
                    "time": 0,
                    "isStart": false
                }
            }
        }

        const setReport = {
            creationDate: new Date(),
            results
        }

        const projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        }

        return DAL.updateOne(projectsCollectionName, projectFilter, { $set: { "report": setReport } });
    },

    updateRequestStart(projectId, requestId) {
        // Update only if report exists in document.
        const projectFilter = {
            _id: DAL.getObjectId(projectId),
            report: { $ne: null }
        }

        const jsonStr = `{ "$set": { "report.results.${requestId}.isStart": true } }`;
        const updateObj = JSON.parse(jsonStr);

        return DAL.updateOne(projectsCollectionName, projectFilter, updateObj);
    },

    updateRequestStatus(requestStatus) {
        // Update only if report exists in document.
        const projectFilter = {
            _id: DAL.getObjectId(requestStatus.projectId),
            report: { $ne: null }
        }

        const jsonStr = `{ "$set": { "report.results.${requestStatus.requestId}.success": ${requestStatus.success},
            "report.results.${requestStatus.requestId}.fail": ${requestStatus.fail},
            "report.results.${requestStatus.requestId}.timeout": ${requestStatus.timeout},
            "report.results.${requestStatus.requestId}.time": ${requestStatus.time} } }`;
        const updateObj = JSON.parse(jsonStr);

        return DAL.updateOne(projectsCollectionName, projectFilter, updateObj);
    },

    finishReport(projectId) {
        // Update only if report exists in document.
        const projectFilter = {
            _id: DAL.getObjectId(projectId),
            report: { $ne: null }
        }

        const updateObj = {
            $set: { "report.isDone": true }
        }

        DAL.updateOne(projectsCollectionName, projectFilter, updateObj)
            .catch(errorHandler.promiseError);
    },

    async saveReport(projectId, totalTime, requestTimeout, env) {
        const projectFilter = {
            _id: DAL.getObjectId(projectId)
        }

        const projectFields = { "_id": 1, "matrix": 1, "report": 1 }

        const projectQueryResult = await DAL.findOneSpecific(projectsCollectionName, projectFilter, projectFields)
            .catch(errorHandler.promiseError);

        let report = {
            "projectId": DAL.getObjectId(projectQueryResult._id),
            "environmentId": env ? env.id : null,
            "date": projectQueryResult.report.creationDate,
            "success": 0,
            "fail": 0,
            "totalTime": totalTime,
            "longestTime": 0
        }

        const results = projectQueryResult.report.results;

        let requestsTotalTime = 0
        let totalRequests = 0;

        Object.keys(results).forEach(requestId => {
            const result = results[requestId];

            report.success += result.success;
            report.fail += result.fail + result.timeout;
            totalRequests += result.success + result.fail + result.timeout;
            requestsTotalTime += result.time;

            const requestsAvgTime = result.time / totalRequests;

            if (requestsAvgTime > report.longestTime) {
                report.longestTime = requestsAvgTime;
            }
        });

        report.requestAverageTime = requestsTotalTime / totalRequests; // seconds

        report.data = {
            "matrix": projectQueryResult.matrix,
            "results": projectQueryResult.report.results,
            "requestTimeout": requestTimeout,
            "environmentValues": env ? env.values : null
        }

        DAL.insert(reportsCollectionName, report).catch(errorHandler.promiseError);
    },


    removeProjectReport(projectId, userId) {
        const projectFilter = {
            _id: DAL.getObjectId(projectId),
            owner: DAL.getObjectId(userId)
        }

        return DAL.updateOne(projectsCollectionName, projectFilter, { $unset: { "report": "" } });
    },

    getAllReports(userId) {
        const projectsFilter = {
            $match: { "owner": DAL.getObjectId(userId) }
        }

        const joinFilter = {
            $lookup:
            {
                from: reportsCollectionName,
                localField: '_id',
                foreignField: 'projectId',
                as: 'reports'
            }
        }

        const fields = {
            $project: {
                "_id": 0,
                "projectId": "$_id",
                "projectName": "$name",
                "lastReportDate": { "$max": "$reports.date" },
                "reportsAmount": { "$size": "$reports" }
            }
        }

        const reportsAmountFilter = {
            $match: { "reportsAmount": { "$gt": 0 } }
        }

        const sort = {
            $sort: { "lastReportDate": -1 }
        }

        const aggregateArray = [projectsFilter, joinFilter, fields, reportsAmountFilter, sort];

        return DAL.aggregate(projectsCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);
    },

    getProjectReports(projectId, userId) {
        // Get all reports by project id.
        const reportFilter = {
            $match: {
                "projectId": DAL.getObjectId(projectId)
            }
        }

        // Add project object to each report.
        const joinProjectFilter = {
            $lookup:
            {
                from: projectsCollectionName,
                localField: 'projectId',
                foreignField: '_id',
                as: 'project'
            }
        }

        // Convert single project array to object.
        const unwindProject = {
            $unwind: {
                path: "$project"
            }
        }

        // Filter reports that belongs to the user (secure validation).
        const reportOwnerFilter = {
            $match: {
                "project.owner": DAL.getObjectId(userId)
            }
        }

        // Filter the report environment (To array).
        const addEnvironment = {
            $addFields: {
                environment: {
                    $filter: {
                        input: "$project.environments",
                        as: "env",
                        cond: { $eq: ["$$env.id", "$environmentId"] }
                    }
                }
            }
        }

        // Convert single environment array to object.
        const unwindEnvironment = {
            $unwind: {
                path: "$environment",
                preserveNullAndEmptyArrays: true
            }
        }

        // Set only the environment name on the report.
        const envField = {
            $addFields: {
                "environment": "$environment"
            }
        }

        // Remove unused properties from report object.
        const fields = {
            $project: {
                "project": 0,
                "data": 0,
                "environmentId": 0,
                "environment.isActive": 0,
                "environment.values": 0
            }
        }

        // Sort the reports by creation date.
        const sort = {
            $sort: { "date": -1 }
        }

        const aggregateArray = [reportFilter, joinProjectFilter, unwindProject,
            reportOwnerFilter, addEnvironment, unwindEnvironment, envField, fields, sort];

        return DAL.aggregate(reportsCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);
    },

    async getReportData(reportId, userId) {
        const reportFilter = {
            $match: {
                "_id": DAL.getObjectId(reportId)
            }
        }

        const joinFilter = {
            $lookup:
            {
                from: projectsCollectionName,
                localField: 'projectId',
                foreignField: '_id',
                as: 'project'
            }
        }

        const reportOwnerFilter = {
            $match: {
                "project.owner": DAL.getObjectId(userId)
            }
        }

        const fields = {
            $project: {
                "data": 1
            }
        }

        const aggregateArray = [reportFilter, joinFilter, reportOwnerFilter, fields];

        const reportData = await DAL.aggregate(reportsCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

        return (reportData.length == 1) ? reportData[0].data : null;
    },

    async deleteReport(projectId, reportId, userId) {
        const projectFilter = {
            "_id": DAL.getObjectId(projectId),
            "owner": DAL.getObjectId(userId)
        }

        const projectCount = await DAL.count(projectsCollectionName, projectFilter)
            .catch(errorHandler.promiseError);

        if (projectCount != 1) {
            return false;
        }

        const reportFilter = {
            "_id": DAL.getObjectId(reportId),
            "projectId": DAL.getObjectId(projectId)
        }

        return DAL.deleteOne(reportsCollectionName, reportFilter)
            .catch(errorHandler.promiseError);
    },

    async deleteFolder(projectId, userId) {
        const projectFilter = {
            "_id": DAL.getObjectId(projectId),
            "owner": DAL.getObjectId(userId)
        }

        const projectCount = await DAL.count(projectsCollectionName, projectFilter)
            .catch(errorHandler.promiseError);

        if (projectCount != 1) {
            return false;
        }

        const reportFilter = {
            "projectId": DAL.getObjectId(projectId)
        }

        return DAL.delete(reportsCollectionName, reportFilter)
            .catch(errorHandler.promiseError);
    },

    async deleteEnvFolder(projectId, environmentId, userId) {
        const projectFilter = {
            "_id": DAL.getObjectId(projectId),
            "owner": DAL.getObjectId(userId)
        }

        const projectCount = await DAL.count(projectsCollectionName, projectFilter)
            .catch(errorHandler.promiseError);

        if (projectCount != 1) {
            return false;
        }

        const reportFilter = {
            "projectId": DAL.getObjectId(projectId),
            environmentId
        }

        return DAL.delete(reportsCollectionName, reportFilter)
            .catch(errorHandler.promiseError);
    }
}