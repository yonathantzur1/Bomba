import { BasicService } from '../../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class PermissionsCardService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/permissions");
    }

    getAllPermissions() {
        return super.get('/getAllPermissions');
    }

    getUserPermissions(userId: string) {
        return super.get('/getUserPermissions?userId=' + userId);
    }

    updatePermissions(userId: string, permissions: Array<any>) {
        let data = { userId, permissions }
        return super.put('/updatePermissions', data);
    }
}