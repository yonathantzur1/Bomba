import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DeleteUserService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/deleteUser");
    }

    validateDeleteUserToken(token: string) {
        return super.get('/validateDeleteUserToken?token=' + token);
    }

    deleteAccount(token: string, password: string) {
        let details = {
            token,
            password
        };

        return super.put('/deleteAccount', details);
    }

}