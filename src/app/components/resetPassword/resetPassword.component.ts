import { Component, OnInit } from '@angular/core';
import { ForgotPasswordService } from 'src/app/services/forgotPassword.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MicrotextService, InputValidation } from 'src/app/services/global/microtext.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

class Password {
    text: string;
    confirm: string;

    constructor() {
        this.text = "";
        this.confirm = "";
    }
}

@Component({
    selector: 'reset-password',
    templateUrl: './resetPassword.html',
    providers: [ForgotPasswordService],
    styleUrls: ['./resetPassword.css']
})

export class ResetPasswordComponent implements OnInit {

    resetCode: string;
    newPassword: Password = new Password();
    isLoading: boolean = false;
    isValid: boolean;

    validations: Array<InputValidation>;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        private forgotPasswordService: ForgotPasswordService) {

        this.validations = [
            {
                isFieldValid(newPassword: Password) {
                    return !!newPassword.text;
                },
                errMsg: "Please enter new password.",
                fieldId: "password-text-micro",
                inputId: "password-text"
            },
            {
                isFieldValid(newPassword: Password) {
                    return newPassword.text.length >= 6;
                },
                errMsg: "Your password must be at least 6 characters long.",
                fieldId: "password-text-micro",
                inputId: "password-text"
            },
            {
                isFieldValid(newPassword: Password) {
                    return !!newPassword.confirm;
                },
                errMsg: "Please confirm your password.",
                fieldId: "password-confirm-micro",
                inputId: "password-confirm"
            },
            {
                isFieldValid(newPassword: Password) {
                    return newPassword.text == newPassword.confirm;
                },
                errMsg: "Your passwords do not match.",
                fieldId: "password-confirm-micro",
                inputId: "password-confirm"
            }
        ];

    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.resetCode = params["resetCode"];

            this.isLoading = true;
            this.forgotPasswordService.isResetCodeValid(this.resetCode).then(result => {
                this.isLoading = false;
                this.isValid = !!result;
            });
        });
    }

    setPassword() {
        if (this.microtextService.validation(this.validations, this.newPassword)) {
            this.forgotPasswordService.setPassword(this.resetCode, this.newPassword.text).then(result => {
                if (!result) {
                    this.snackbarService.error();
                }
                else {
                    this.snackbarService.snackbar("Password has been changed");
                    this.router.navigateByUrl("/login");
                }
            });
        }
    }

    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}