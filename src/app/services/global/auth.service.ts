import { Injectable } from '@angular/core';

import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/auth");
    }

    getCurrUser() {
        return super.get('/getCurrUser');
    }

    isUserOnSession() {
        return super.get('/isUserOnSession');
    }

    isUserAdmin() {
        return super.get('/isUserAdmin');
    }

    deleteClientAuth() {
        return super.get('/deleteClientAuth');
    }
}