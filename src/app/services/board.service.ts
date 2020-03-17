import { Injectable } from '@angular/core';

import { Request } from '../components/requestCard/requestCard.component';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BoardService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/board");
    }

    getProjectBoard(projectId: string) {
        return super.get('/getProjectBoard?projectId=' + projectId);
    }

    saveMatrix(projectId: string, matrix: Array<Array<Request>>) {
        let data = {
            projectId,
            matrix
        }

        return super.put('/saveMatrix', data);
    }

    saveRequests(projectId: string, requests: Array<Request>) {
        let data = {
            projectId,
            requests
        }

        return super.put('/saveRequests', data);
    }
}