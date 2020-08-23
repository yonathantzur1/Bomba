import { Injectable } from '@angular/core';

import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';

import { STATISTICS_RANGE, LOG_TYPE } from '../../enums';

@Injectable()
export class TrackerService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/admin/tracker");
    }

    getChartData(logType: LOG_TYPE,
        range: STATISTICS_RANGE,
        datesRange: Object,
        clientTimeZone: number,
        username: string) {
        const data = {
            logType,
            range,
            datesRange,
            clientTimeZone,
            username
        }

        return super.post('/getChartData', data);
    }

    isUserExists(username: string) {
        return super.get('/isUserExists?username=' + username);
    }
}