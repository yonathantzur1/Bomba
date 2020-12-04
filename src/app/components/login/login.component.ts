import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SnackbarService } from '../../services/global/snackbar.service';
import { MicrotextService, InputValidation } from '../../services/global/microtext.service';

import { LoginService } from '../../services/login.service';
import { GlobalService } from 'src/app/services/global/global.service';

declare const $: any;

export class User {
    username: string;
    password: string;

    constructor() {
        this.username = "";
        this.password = "";
    }
}

@Component({
    selector: 'login',
    templateUrl: './login.html',
    providers: [LoginService],
    styleUrls: ['./login.css']
})

export class LoginComponent implements OnInit {
    user: User = new User();
    isLoading: boolean = false;
    validations: Array<InputValidation>;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        public snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        private loginService: LoginService,
        private globalService: GlobalService) {

        this.validations = [
            {
                isFieldValid(user: User) {
                    return !!user.username;
                },
                errMsg: "Please enter username or email address",
                fieldId: "login-username-micro",
                inputId: "login-username"
            },
            {
                isFieldValid(user: User) {
                    return !!user.password;
                },
                errMsg: "Please enter password",
                fieldId: "login-password-micro",
                inputId: "login-password"
            }
        ];
    }

    ngOnInit() {
        this.globalService.resetGlobalVariables();
        this.globalService.dynamicInput();
    }

    // Login user and redirect him to main page.
    login() {
        this.user.username = this.user.username.trim();

        // In case the login fields are valid.
        if (this.microtextService.validation(this.validations, this.user)) {
            this.isLoading = true;
            const self = this;

            this.loginService.login(this.user).then((data: any) => {
                let result = data ? data.result : null;
                this.isLoading = false;

                // In case of server error.
                if (result == null) {
                    this.snackbarService.error();
                }
                // In case the login details is incorrect.
                else if (result == false) {
                    this.snackbarService.snackbar("Incorrect username or password");
                }
                else {
                    // In case the user is locked via brute attack.
                    if (result.lock) {
                        let lockTimeStr = result.lock + ((result.lock == 1) ? " minute" : " minutes");
                        this.snackbarService.snackbar("The account is locked for " + lockTimeStr);
                    }
                    else {
                        // Show the loader again because the guard validates the token.
                        this.snackbarService.hideSnackbar();
                        this.isLoading = true;
                        this.router.navigateByUrl('');
                    }
                }
            });
        }
    }

    loginEnter() {
        $(".user-input").blur();
        this.login();
    }

    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}