const DAL = require('../../DAL');
const config = require('../../../config');
const STATISTICS_RANGE = require('../../enums').STATISTICS_RANGE;

const errorHandler = require('../../handlers/errorHandler');

const logsCollectionName = config.db.collections.logs;
const usersCollectionName = config.db.collections.users;

module.exports = {
    async getLogData(logType, range, datesRange, clientTimeZone, username) {
        let barsNumber;
        let rangeKey;
        let groupFilter;
        const dateWithOffsetQuery = {
            date: "$date",
            timezone: getTimeZoneOffsetString(clientTimeZone)
        };

        switch (range) {
            case STATISTICS_RANGE.YEARLY: {
                barsNumber = 12;
                rangeKey = "month";
                groupFilter = { month: { $month: dateWithOffsetQuery }, year: { $year: dateWithOffsetQuery } };
                break;
            }
            case STATISTICS_RANGE.WEEKLY: {
                barsNumber = 7;
                rangeKey = "dayOfWeek";
                groupFilter = { dayOfWeek: { $dayOfWeek: dateWithOffsetQuery }, month: { $month: dateWithOffsetQuery }, year: { $year: dateWithOffsetQuery } };
                break;
            }
            default: {
                return errorHandler.promiseError("Range " + range + " is not valid");
            }
        }

        let filter = {
            "type": logType,
            "date": {
                $gte: new Date(datesRange.startDate),
                $lte: new Date(datesRange.endDate)
            }
        };

        if (username) {
            filter["$or"] = [{ username }, { "email": username }]
        }

        const logsFilter = {
            $match: filter
        };

        const groupObj = {
            $group: {
                _id: groupFilter,
                count: { $sum: 1 }
            }
        };

        const result = await DAL.aggregate(logsCollectionName, [logsFilter, groupObj])
            .catch(errorHandler.promiseError);

        let data = [].fill(null, barsNumber);

        result.forEach(logGroup => {
            data[logGroup._id[rangeKey] - 1] = logGroup.count;
        });

        return data;

    },

    async isUserExists(username) {
        const filter = {
            $or: [
                { username },
                { "email": username }]
        }

        const users = await DAL.count(usersCollectionName, filter)
            .catch(errorHandler.promiseError);

        return (users > 0);
    }
};

function getTimeZoneOffsetString(clientTimeZone) {
    // Convert the sign to the opposite for the mongo timezone calculation.
    clientTimeZone *= -1;
    const isPositive = (clientTimeZone >= 0);

    let hours = clientTimeZone / 60;
    let minutes = clientTimeZone - (hours * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    return (isPositive ? "+" : "-") + hours + ":" + minutes;
}