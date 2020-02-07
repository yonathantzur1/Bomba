import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { STATISTICS_RANGE, LOG_TYPE } from '../../enums/enums';

@Injectable()
export class StatisticsService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/statistics");
    }

    getChartData(logType: LOG_TYPE,
        range: STATISTICS_RANGE,
        datesRange: Object,
        clientTimeZone: number,
        email: string) {
        let data = {
            logType,
            range,
            datesRange,
            clientTimeZone,
            email
        }

        return super.post('/getChartData', data);
    }

    getUserByEmail(email: string) {
        return super.get('/getUserByEmail?email=' + email);
    }
}