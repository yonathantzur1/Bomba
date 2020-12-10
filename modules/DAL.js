const config = require('../config');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const logger = require('../logger');

const errorHandler = require('./handlers/errorHandler');

// Connection parameters
const connectionString = config.db.connectionString;
const dbName = config.db.name;
let db;

(getDB = async () => {
    // In case db connection exists and open.
    if (db && db.serverConfig.isConnected()) {
        return db;
    }
    else {
        const client = await MongoClient.connect(connectionString,
            { useNewUrlParser: true, useUnifiedTopology: true })
            .catch(errorHandler.promiseError);

        return (db = client.db(dbName));
    }
})().catch(err => { logger.warn(err) });

async function getCollection(collectionName) {
    const db = await getDB().catch(errorHandler.promiseError);

    return db.collection(collectionName);
}

module.exports = {
    // Convert string id to MongoDB object id.
    getObjectId(id) {
        return new ObjectId(id.toString());
    },

    // Convert array of string ids to MongoDB object ids.
    getArrayObjectId(arr) {
        return arr.map(id => {
            return this.getObjectId(id);
        });
    },

    // Get one document from collection by filter.
    async findOne(collectionName, filter) {
        const collection = await getCollection(collectionName).catch(errorHandler.promiseError);

        return collection.findOne(filter);
    },

    // Get document specific fields from collection by filter.
    async findOneSpecific(collectionName, filter, projection) {
        const collection = await getCollection(collectionName).catch(errorHandler.promiseError);

        return collection.findOne(filter, { projection });
    },

    // Get documents from collection by filter.
    async find(collectionName, filter, sortObj) {
        const collection = await getCollection(collectionName).catch(errorHandler.promiseError);

        return collection.find(filter).sort(sortObj || {}).toArray();
    },

    // Get documents specific fields from collection by filter.
    async findSpecific(collectionName, filter, projection, sortObj) {
        const collection = await getCollection(collectionName).catch(errorHandler.promiseError);

        return collection.find(filter, { projection }).sort(sortObj || {}).toArray();
    },

    // Aggregate documents.
    async aggregate(collectionName, aggregateArray) {
        const collection = await getCollection(collectionName).catch(errorHandler.promiseError);

        return collection.aggregate(aggregateArray).toArray();
    },

    // Insert new document.
    async insert(collectionName, doc) {
        try {
            const collection = await getCollection(collectionName);
            const result = await collection.insertOne(doc);

            return result.insertedId;
        }
        catch (err) {
            return errorHandler.promiseError(err);
        }
    },

    // Update one document.
    async updateOne(collectionName, findObj, updateObj) {
        try {
            const collection = await getCollection(collectionName);
            const updateResult = await collection.findOneAndUpdate(findObj, updateObj, {
                upsert: false
            });

            return updateResult.value || false;
        }
        catch (err) {
            return errorHandler.promiseError(err);
        }
    },

    // Update documents.
    async update(collectionName, findObj, updateObj) {
        try {
            const collection = await getCollection(collectionName);
            const updateResult = await collection.updateMany(findObj, updateObj, {
                upsert: false
            });
            const modifiedAmount = updateResult.result.nModified;

            return (modifiedAmount > 0 ? modifiedAmount : false);
        }
        catch (err) {
            return errorHandler.promiseError(err);
        }
    },

    // Delete documents by filter.
    async delete(collectionName, filter) {
        try {
            const collection = await getCollection(collectionName);
            const deleteResult = await collection.deleteMany(filter);
            const deletedAmount = deleteResult.deletedCount;

            return (deletedAmount > 0 ? deletedAmount : false);
        }
        catch (err) {
            return errorHandler.promiseError(err);
        }
    },

    // Delete one document by filter.
    async deleteOne(collectionName, filter) {
        try {
            const collection = await getCollection(collectionName);
            const deleteResult = await collection.deleteOne(filter);

            return (deleteResult.result.n != 0);
        }
        catch (err) {
            return errorHandler.promiseError(err);
        }
    },

    // Getting documents amount by filter.
    async count(collectionName, filter) {
        const collection = await getCollection(collectionName).catch(errorHandler.promiseError);

        return collection.find(filter).count();
    }
};