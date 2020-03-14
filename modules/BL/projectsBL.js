const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    async addProject(name, ownerId) {
        let project = {
            name,
            owner: DAL.getObjectId(ownerId)
        };

        let insertResult = await DAL.insert(projectsCollectionName, project)
            .catch(errorHandler.promiseError);

        return insertResult;
    }
};