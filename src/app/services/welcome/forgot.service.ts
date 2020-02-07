import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ForgotUser } from '../../components/welcome/forgot/forgot.component';

@Injectable()
export class ForgotService extends BasicService {
    constructor(public http: HttpClient) {
        super(http, "/api/forgotPassword");
    }

    forgotPasswordRequest(email: string) {
        let details = { "email": email };

        return super.put('/forgotPasswordRequest', details);
    }

    resetPassword(forgotUser: ForgotUser) {
        let details = {
            "email": forgotUser.email,
            "code": forgotUser.code,
            "newPassword": forgotUser.newPassword
        };

        return super.put('/resetPassword', details);
    }

    validateResetPasswordToken(token: string) {
        return super.get('/validateResetPasswordToken?token=' + token);
    }

    resetPasswordByToken(token: string, newPassword: string) {
        let details = { token, newPassword };

        return super.put('/resetPasswordByToken', details);
    }
}