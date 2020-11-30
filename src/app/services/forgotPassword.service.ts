import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ForgotPasswordService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/forgotPassword");
    }

    restorePassword(username: string) {
        const data = { username }

        return super.post("/restorePassword", data);
    }
}