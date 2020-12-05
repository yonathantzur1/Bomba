import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { NewUser } from '../components/register/register.component';

@Injectable()
export class RegisterService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/register");
    }

    register(user: NewUser) {
        return super.post('/register', user);
    }

    verifyUser(verificationCode: string) {
        const data = { verificationCode };

        return super.put('/verifyUser', data);
    }

}