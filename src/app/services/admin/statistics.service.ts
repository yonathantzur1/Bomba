import { Injectable } from '@angular/core';

import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class StatisticsService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/admin/statistics");
    }

    getStatistics() {
        return super.get('/getStatistics');
    }
}