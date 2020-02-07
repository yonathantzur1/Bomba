import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { User } from '../../components/welcome/login/login.component';

@Injectable()
export class LoginService extends BasicService {
    
    constructor(public http: HttpClient) {
        super(http, "/api/login");
    }

    login(user: User) {
        return super.post('/userLogin', user);
    }

    deleteTokenFromCookie() {
        return super.delete('/deleteToken');
    }
}