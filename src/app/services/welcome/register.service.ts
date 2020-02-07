import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { NewUser } from '../../components/welcome/register/register.component';

@Injectable()
export class RegisterService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/register");
    }

    register(newUser: NewUser) {
        let details = {
            "firstName": newUser.firstName,
            "lastName": newUser.lastName,
            "email": newUser.email,
            "password": newUser.password
        };

        return super.post('/register', details);
    }

}