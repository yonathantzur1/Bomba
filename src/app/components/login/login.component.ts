import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { EventService } from '../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../services/global/alert.service';
import { SnackbarService } from '../../services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from '../../services/global/microtext.service';

import { LoginService } from '../../services/login.service';

declare let $: any;

export class User {
    username: string = '';
    password: string = '';
}

@Component({
    selector: 'login',
    templateUrl: './login.html',
    providers: [LoginService],
    styleUrls: ['./login.css']
})

export class LoginComponent {
    user: User = new User();
    isLoading: boolean = false;
    validationFuncs: Array<InputFieldValidation>;

    constructor(private router: Router,
        public alertService: AlertService,
        public snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        public eventService: EventService,
        private loginService: LoginService) {
        this.validationFuncs = [
            {
                isFieldValid(user: User) {
                    return !!user.username;
                },
                errMsg: "Please enter username",
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

    // Login user and redirect him to main page.
    login() {
        this.user.username = this.user.username.trim();

        // In case the login fields are valid.
        if (this.microtextService.validation(this.validationFuncs, this.user)) {
            this.isLoading = true;
            let self = this;

            this.loginService.login(this.user).then((data: any) => {
                let result = data ? data.result : null;
                this.isLoading = false;

                // In case of server error.
                if (result == null) {
                    this.snackbarService.snackbar("Server error occurred");
                }
                // In case the login details is incorrect.
                else if (result == false) {
                    this.snackbarService.snackbar("Username or password is wrong");
                }
                // In case the user was not found.
                else if (result == "-1") {
                    // this.alertService.alert({
                    //     title: "משתמש לא קיים במערכת",
                    //     text: "האם ברצונך להרשם?",
                    //     type: ALERT_TYPE.INFO,
                    //     confirmBtnText: "כן",
                    //     cancelBtnText: "לא",
                    //     confirmFunc: function () {
                    //         self.router.navigateByUrl('/register');
                    //     }
                    // });
                }
                else {
                    // In case the user is locked via brute attack.
                    if (result.lock) {
                        let lockTimeStr = result.lock + ((result.lock == 1) ? " minute" :  " minutes");
                        this.snackbarService.snackbar("The account is locked for " + lockTimeStr);
                    }
                    else {
                        // Show the loader again because the gurd validates the token.
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

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}