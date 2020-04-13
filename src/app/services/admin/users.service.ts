import { Injectable } from '@angular/core';

import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { UserEdit } from 'src/app/components/admin/users/userCard/userEdit/userEdit.component';

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

    saveUserEdit(userEdit: UserEdit) {
        return super.put('/saveUserEdit', userEdit);
    }

    deleteUser(userId: string) {
        return super.put('/deleteUser?userId=' + userId);
    }
}