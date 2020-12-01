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

    isResetCodeValid(resetCode: string) {
        return super.get("/isResetCodeValid?resetCode=" + resetCode);
    }

    setPassword(resetCode: string, password: string) {
        const data = { resetCode, password }

        return super.put("/setPassword", data);
    }
}