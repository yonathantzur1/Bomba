import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/auth");
    }

    isUserOnSession() {
        return super.get('/isUserOnSession');
    }

    isUserRoot() {
        return super.get('/isUserRoot');
    }

    getCurrUser() {
        return super.get('/getCurrUser');
    }

    setCurrUserToken() {
        return super.get('/setCurrUserToken');
    }

    isUserSocketConnect() {
        return super.get('/isUserSocketConnect');
    }

    getUserPermissions() {
        return super.get('/getUserPermissions');
    }
}