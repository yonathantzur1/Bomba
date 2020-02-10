import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BoardService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/board");
    }

    exampleGet() {
        return super.get('/example');
    }

    examplePost(str: string) {
        let data = { str };

        return super.post('/example', data);
    }
}