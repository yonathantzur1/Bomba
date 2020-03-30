import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ReportsService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/reports");
    }

    removeReport(projectId: string) {
        return super.delete('/removeReport?projectId=' + projectId);
    }

    getAllReports() {
        return super.get('/getAllReports');
    }

    getProjectReports(projectId: string) {
        return super.get('/getProjectReports?projectId=' + projectId);
    }
}