import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UserEditWindowService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/userEditWindow");
    }

    updateUserInfo(updateFields: any) {
        let details = { updateFields };

        return super.put('/updateUserInfo', details);
    }
}