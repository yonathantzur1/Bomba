import { Component, OnInit, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';

import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

import { RegisterService } from 'src/app/services/register.service';

declare const $: any;

export class NewUser {
    username: string;
    email: string;
    password: string;

    constructor() {
        this.username = "";
        this.email = "";
        this.password = "";
    }
}

@Component({
    selector: 'register',
    templateUrl: './register.html',
    providers: [RegisterService],
    styleUrls: ['./register.css']
})

export class RegisterComponent implements OnInit {
    @Input() username: string;

    user: NewUser = new NewUser();
    isLoading: boolean = false;
    validations: Array<InputFieldValidation>;

    constructor(private router: Router,
        private registerService: RegisterService,
        private microtextService: MicrotextService,
        private eventService: EventService,
        public snackbarService: SnackbarService) {
        this.validations = [
            {
                isFieldValid(user: NewUser) {
                    user.username = user.username.trim();
                    return !!user.username;
                },
                errMsg: "Please enter username",
                fieldId: "register-username-micro",
                inputId: "register-username"
            },
            {
                isFieldValid(user: NewUser) {
                    const usernameRegexp = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/;
                    return (usernameRegexp.test(user.username));
                },
                errMsg: "Username may only contain alphanumeric characters",
                fieldId: "register-username-micro",
                inputId: "register-username"
            },
            {
                isFieldValid(user: NewUser) {
                    user.email = user.email.trim();
                    return !!user.email;
                },
                errMsg: "Please enter email address",
                fieldId: "register-email-micro",
                inputId: "register-email"
            },
            {
                isFieldValid(user: NewUser) {
                    const emailRegexp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
                    return (emailRegexp.test(user.email));
                },
                errMsg: "Email address is invalid",
                fieldId: "register-email-micro",
                inputId: "register-email"
            },
            {
                isFieldValid(user: NewUser) {
                    return !!user.password;
                },
                errMsg: "Please enter password",
                fieldId: "register-password-micro",
                inputId: "register-password"
            },
            {
                isFieldValid(user: NewUser) {
                    return user.password.length >= 6;
                },
                errMsg: "Your password must be at least 6 characters long",
                fieldId: "register-password-micro",
                inputId: "register-password"
            }
        ];
    }

    ngOnInit() {
        if (this.username) {
            if (this.username.includes("@")) {
                this.user.email = this.username;
            }
            else {
                this.user.username = this.username;
            }
        }
    }

    register() {
        if (this.microtextService.validation(this.validations, this.user)) {
            this.isLoading = true;

            this.registerService.register(this.user).then(data => {
                this.isLoading = false;
                const result = data ? data.result : null;

                if (!result) {
                    this.snackbarService.error();
                }
                // In case the username is already exists.
                else if (result == "-1") {
                    $("#register-username-micro").html("The username is already in use");
                }
                // In case the email is already exists.
                else if (result == "-2") {
                    $("#register-email-micro").html("The email is already in use");
                }
                else {
                    this.microtextService.restartAll(this.validations);
                    this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                    this.router.navigateByUrl("/");
                }
            });
        }
    }

    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.key == "Enter") {
            this.register();
        }
    }
}