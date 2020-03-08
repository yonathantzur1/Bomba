import { Injectable } from '@angular/core';

import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/auth");
    }

    isUserOnSession() {
        return super.get('/isUserOnSession');
    }

    deleteClientAuth() {
        return super.get('/deleteClientAuth');
    }
}