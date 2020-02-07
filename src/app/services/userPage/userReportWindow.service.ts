import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UserReportWindowService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userReportWindow");
    }

    getAllReportReasons() {
        return super.get('/getAllReportReasons');
    }

    reportUser(reportedUserId: string, reasonId: string, reasonDetails: string) {
        let data = { reportedUserId, reasonId, reasonDetails };

        return super.post('/reportUser', data);
    }
}