const DAL = require('../DAL');
const config = require('../../config');
const errorHandler = require('../handlers/errorHandler');

const projectsCollectionName = config.db.collections.projects;

module.exports = {
    getProjects(ownerId) {
        return DAL.find(projectsCollectionName,
            { owner: DAL.getObjectId(ownerId) },
            { "date": 1 });
    },

    async addProject(name, ownerId) {
        if (await isProjectExists(name, ownerId)) {
            return false;
        }

        let project = {
            name,
            owner: DAL.getObjectId(ownerId),
            date: new Date()
        };

        let insertResult = await DAL.insert(projectsCollectionName, project)
            .catch(errorHandler.promiseError);

        return insertResult.toString();
    }
};

async function isProjectExists(name, ownerId) {
    let filter = {
        name,
        owner: DAL.getObjectId(ownerId)
    };

    let count = await DAL.count(projectsCollectionName, filter)
        .catch(errorHandler.promiseError);

    return !!count;
}