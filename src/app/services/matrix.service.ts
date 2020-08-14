import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

import { Request } from '../components/requestCard/requestCard.component'

@Injectable()
export class MatrixService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/matrix");
    }

    testRequest(request: Request, requestTimeout: number) {
        let data = { request, requestTimeout };

        return super.post('/testRequest', data);
    }

    sendRequests(matrix: Request[][], projectId: string, requestTimeout: number) {
        let data = { matrix, projectId, requestTimeout };

        return super.post('/sendRequests', data);
    }

    stopRequests(projectId: string) {
        let data = { projectId };

        return super.post('/stopRequests', data);
    }
}