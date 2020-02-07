import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Password } from '../../components/userPage/userPasswordWindow/userPasswordWindow.component';

@Injectable()
export class UserPasswordWindowService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userPasswordWindow");
    }

    updateUserPassword(password: Password) {
        return super.put('/updateUserPassword', password);
    }

    changePasswordByMail() {
        return super.get('/changePasswordByMail');
    }
}