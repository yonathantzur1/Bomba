const DAL = require('../DAL');
const config = require('../../config');
const generator = require('../generator');
const sha512 = require('js-sha512');

const errorHandler = require('../handlers/errorHandler');
const mailer = require('../mailer');

const usersCollectionName = config.db.collections.users;

module.exports = {
    async restorePassword(username) {
        const userFilter = {
            $or: [
                { username },
                { email: username }
            ]
        }
        const user = await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError);

        if (!user) {
            return true;
        }

        let restorePassword = user.restorePassword;

        if (!restorePassword) {
            restorePassword = {
                code: generator.generateId(),
                date: new Date()
            }
            const restorePasswordUpdate = { $set: { restorePassword } }

            await DAL.updateOne(usersCollectionName, userFilter, restorePasswordUpdate)
                .catch(errorHandler.promiseError);
        }

        this.sendRestoreMail(user.email, user.username, restorePassword.code);

        return true;
    },

    sendRestoreMail(email, username, restorePasswordCode) {
        const restoreUrl = `${config.address.site}/rest-password/${restorePasswordCode}`;
        mailer.restorePassword(email, username, restoreUrl);
    }
}