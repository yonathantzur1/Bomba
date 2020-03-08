import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

import { NewUser } from '../components/admin/register/register.component';

@Injectable()
export class RegisterService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/register");
    }

    register(newUser: NewUser) {
        return super.post('/register', newUser);
    }

}