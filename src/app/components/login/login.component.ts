import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { EventService, EVENT_TYPE } from '../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../services/global/alert.service';
import { SnackbarService } from '../../services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from '../../services/global/microtext.service';

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

export class LoginComponent implements OnInit, OnDestroy {
    user: User = new User();
    isLoading: boolean = false;
    isShowRegister: boolean = false;
    validationFuncs: Array<InputFieldValidation>;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        public alertService: AlertService,
        public snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        public eventService: EventService,
        private loginService: LoginService,
        private globalService: GlobalService) {

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowRegister = false;
        });

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

    ngOnInit() {
        this.globalService.resetGlobalVariables();
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    // Login user and redirect him to main page.
    login() {
        this.user.username = this.user.username.trim();

        // In case the login fields are valid.
        if (this.microtextService.validation(this.validationFuncs, this.user)) {
            this.isLoading = true;
            const self = this;

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
                    this.alertService.alert({
                        title: "User does not exist",
                        text: "Would you like to register?",
                        type: ALERT_TYPE.INFO,
                        confirmBtnText: "Yes",
                        closeBtnText: "No",
                        confirmFunc: () => {
                            self.globalService.setData("registerUsername", self.user.username);
                            self.isShowRegister = true;
                        }
                    });
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

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}