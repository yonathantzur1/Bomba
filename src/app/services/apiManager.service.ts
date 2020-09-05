import { Injectable } from '@angular/core';

import { Request } from '../components/requestCard/requestCard.component';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiManagerService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/apiManager");
    }

    getApiKey() {
        return super.get('/getApiKey');
    }

    getProjectsForApi() {
        return super.get('/getProjectsForApi');
    }
}