import { Injectable } from '@angular/core';

import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UsersService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/admin/users");
    }

    getUser(searchInput: string) {
        return super.post('/getUser', { searchInput });
    }

    changeAdminStatus(userId: string, isAdmin: boolean) {
        return super.put('/changeAdminStatus', { userId, isAdmin });
    }
}