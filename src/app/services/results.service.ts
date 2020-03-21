import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class ResultsService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/results");
    }

    getResults(projectId: string) {
        return super.get('/getResults?projectId=' + projectId);
    }

    removeResults(projectId: string) {
        return super.delete('/removeResults?projectId=' + projectId);
    }

}