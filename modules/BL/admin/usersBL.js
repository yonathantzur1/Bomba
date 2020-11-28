const DAL = require('../../DAL');
const config = require('../../../config');
const generator = require('../../generator');
const sha512 = require('js-sha512');
const errorHandler = require('../../handlers/errorHandler');
const registerBL = require('../registerBL');

const usersCollectionName = config.db.collections.users;
const projectsCollectionName = config.db.collections.projects;
const reportsCollectionName = config.db.collections.reports;
const logsCollectionName = config.db.collections.logs;

module.exports = {
    async getUser(searchInput) {
        // In case the input is empty, return empty result.
        if (!searchInput || !(searchInput = searchInput.trim())) {
            return null;
        }

        searchInput = searchInput.replace(/\\/g, '').trim();

        let usersFilter = {
            $or: [
                { username: searchInput },
                { email: searchInput }
            ]
        }

        let userFields = {
            "_id": 1,
            "username": 1,
            "email": 1,
            "creationDate": 1,
            "isAdmin": 1,
            "lastLoginTime": 1
        }

        let user = await DAL.findOneSpecific(usersCollectionName, usersFilter, userFields)
            .catch(errorHandler.promiseError);

        if (!user) {
            return null;
        }

        let projectsFilter = { "owner": DAL.getObjectId(user._id) }

        let userProjects = await DAL.count(projectsCollectionName, projectsFilter)
            .catch(errorHandler.promiseError);

        user.projects = userProjects;

        return user;
    },

    changeAdminStatus(userId, isAdmin) {
        let userFilter = {
            "_id": DAL.getObjectId(userId)
        }

        let updateObj = {
            $set: { isAdmin }
        }

        return DAL.updateOne(usersCollectionName, userFilter, updateObj);
    },

    async saveUserEdit(userEdit) {
        let updateObj = { $set: {} };
        let userFilter = { "_id": DAL.getObjectId(userEdit.id) }

        let originalUser = (await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError));

        if (originalUser.username != userEdit.username) {
            const isExists = await registerBL.isUsernameExists(userEdit.username)
                .catch(errorHandler.promiseError);

            if (isExists) {
                return "-1";
            }

            updateObj["$set"]["username"] = username;
        }

        if (originalUser.email != userEdit.email) {
            const isExists = await registerBL.isEmailExists(userEdit.email)
                .catch(errorHandler.promiseError);

            if (isExists) {
                return "-2";
            }

            updateObj["$set"]["email"] = email;
        }

        if (userEdit.password) {
            let salt = generator.generateCode(config.security.password.saltSize);
            let password = sha512(userEdit.password + salt);
            updateObj["$set"]["password"] = password;
            updateObj["$set"]["salt"] = salt;
        }

        if (Object.keys(updateObj["$set"]).length > 0) {
            const updateResult = await DAL.updateOne(usersCollectionName, userFilter, updateObj)
                .catch(errorHandler.promiseError);
            return !!updateResult;
        }

        return true;
    },

    async deleteUser(userId) {
        let userFilter = {
            "_id": DAL.getObjectId(userId)
        }

        let projectFilter = {
            "owner": DAL.getObjectId(userId)
        }

        let username = (await DAL.findOneSpecific(usersCollectionName, userFilter, { "username": 1 })).username;

        let userProjects = await DAL.findSpecific(projectsCollectionName, projectFilter, { "_id": 1 });

        userProjects = userProjects.map(project => {
            return project._id;
        });

        let deleteUser = DAL.deleteOne(usersCollectionName, userFilter);
        let deleteUserProjects = DAL.delete(projectsCollectionName, projectFilter);
        let deleteUserProjectsReports = DAL.delete(reportsCollectionName,
            { "projectId": { $in: userProjects } });
        let deleteUserLogs = DAL.delete(logsCollectionName, { username });

        let actions = [deleteUser, deleteUserProjects, deleteUserProjectsReports, deleteUserLogs];

        return Promise.all(actions);
    }
}