import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

import { Request } from '../components/requestCard/requestCard.component'

@Injectable()
export class MatrixService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/matrix");
    }

    sendRequests(matrix: Array<Array<Request>>) {
        let data = { matrix };

        return super.post('/sendRequests', data);
    }
}