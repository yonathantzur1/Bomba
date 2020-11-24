import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ReportsService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/reports");
    }

    setReportName(reportId: string, projectId: string, name: string) {
        return super.put('/setReportName', { reportId, projectId, name });
    }

    removeProjectReport(projectId: string) {
        return super.delete('/removeProjectReport?projectId=' + projectId);
    }

    getAllReports() {
        return super.get('/getAllReports');
    }

    getProjectReports(projectId: string) {
        return super.get('/getProjectReports?projectId=' + projectId);
    }

    getReportData(reportId: string) {
        return super.get('/getReportData?reportId=' + reportId);
    }

    deleteReport(projectId: string, reportId: string) {
        return super.delete('/deleteReport?projectId=' + projectId +
            "&reportId=" + reportId);
    }

    deleteFolder(projectId: string) {
        return super.delete('/deleteFolder?projectId=' + projectId);
    }

    deleteEnvFolder(projectId: string, envId: string) {
        return super.delete('/deleteEnvFolder?projectId=' + projectId +
            "&envId=" + envId);
    }
}