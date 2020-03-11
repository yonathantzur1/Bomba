import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

import { User } from '../components/login/login.component';

@Injectable()
export class RegisterService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/register");
    }

    register(user: User) {
        return super.post('/register', user);
    }

}