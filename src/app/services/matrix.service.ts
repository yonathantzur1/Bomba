import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

import { Request } from '../components/requestCard/requestCard.component'
import { Environment } from '../components/environments/environments.component';

@Injectable()
export class MatrixService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/matrix");
    }

    testRequest(request: Request, requestTimeout: number) {
        const data = { request, requestTimeout };

        return super.post('/testRequest', data);
    }

    sendRequests(matrix: Request[][], projectId: string, requestTimeout: number, env: Environment) {
        const data = { matrix, projectId, requestTimeout, env };

        return super.post('/sendRequests', data);
    }

    stopRequests(projectId: string) {
        const data = { projectId };

        return super.post('/stopRequests', data);
    }
}