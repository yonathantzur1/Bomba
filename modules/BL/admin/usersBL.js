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
        if (!searchInput) {
            return null;
        }

        searchInput = searchInput.replace(/\\/g, '').trim();

        let usersFilter = { username: searchInput }

        let userFields = {
            "_id": 1,
            "username": 1,
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
        let userFilter = {
            "_id": DAL.getObjectId(userEdit.id)
        }

        let originalUsername = (await DAL.findOneSpecific(usersCollectionName, userFilter, { "username": 1 })
            .catch(errorHandler.promiseError)).username;

        if (originalUsername != userEdit.username) {
            const isExists = await registerBL.isUserExists(userEdit.username)
                .catch(errorHandler.promiseError);

            if (isExists) {
                return false;
            }
        }

        let updateObj = {
            $set: { "username": userEdit.username }
        }

        if (userEdit.password) {
            let salt = generator.generateCode(config.security.password.saltSize);
            let password = sha512(userEdit.password + salt);
            updateObj["$set"]["password"] = password;
            updateObj["$set"]["salt"] = salt;
        }

        return DAL.updateOne(usersCollectionName, userFilter, updateObj);
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