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
        let isRangeValid = true;
        let dateWithOffsetQuery = { date: "$date", timezone: getTimeZoneOffsetString(clientTimeZone) };

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
                isRangeValid = false;
            }
        }

        if (!isRangeValid) {
            return errorHandler.promiseError("Range " + range + " is not valid");
        }

        let filter = {
            "type": logType,
            "date": {
                $gte: new Date(datesRange.startDate),
                $lte: new Date(datesRange.endDate)
            }
        };

        username && (filter.username = username);

        let logsFilter = {
            $match: filter
        };

        let groupObj = {
            $group: {
                _id: groupFilter,
                count: { $sum: 1 }
            }
        };

        let aggregate = [logsFilter, groupObj];

        let result = await DAL.aggregate(logsCollectionName, aggregate)
            .catch(errorHandler.promiseError);

        let data = [];

        for (let i = 0; i < barsNumber; i++) {
            data.push(null);
        }

        result.forEach(logGroup => {
            data[logGroup._id[rangeKey] - 1] = logGroup.count;
        });

        return data;

    },

    async isUserExists(username) {
        let users = await DAL.count(usersCollectionName, { username })
            .catch(errorHandler.promiseError);

        return (users > 0);
    }
};

function getTimeZoneOffsetString(clientTimeZone) {
    // Convert the sign to the opposite for the mongo timezone calculation.
    clientTimeZone *= -1;
    let isPositive = (clientTimeZone >= 0);

    let hours = clientTimeZone / 60;
    let minutes = clientTimeZone - (hours * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let offsetString = (isPositive ? "+" : "-") + hours + ":" + minutes;

    return offsetString;
}