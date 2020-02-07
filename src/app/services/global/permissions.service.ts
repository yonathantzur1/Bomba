import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../global/auth.service';

import { PERMISSION } from '../../enums/enums';

@Injectable()
export class PermissionsService extends AuthService {
    userPermissions: Array<string>;

    constructor(public http: HttpClient) {
        super(http);
        this.userPermissions = [];
    }

    async initialize() {
        this.userPermissions = (await super.getUserPermissions()) || [];
    }

    deletePermissions() {
        this.userPermissions = [];
    }

    isUserHasAdminPermission() {
        return this.userPermissions.includes(PERMISSION.ADMIN);
    }

    isUserHasMasterPermission() {
        return this.userPermissions.includes(PERMISSION.MASTER);
    }

    isUserHasRootPermission() {
        return (this.isUserHasAdminPermission() || this.isUserHasMasterPermission());
    }
}