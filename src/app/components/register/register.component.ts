import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

import { RegisterService } from 'src/app/services/register.service';

import { User } from 'src/app/components/login/login.component';
import { GlobalService } from 'src/app/services/global/global.service';

declare const $: any;

@Component({
    selector: 'register',
    templateUrl: './register.html',
    providers: [RegisterService],
    styleUrls: ['./register.css']
})

export class RegisterComponent implements OnInit {
    user: User = new User();
    isLoading: boolean = false;
    validationFuncs: Array<InputFieldValidation>;

    constructor(private router: Router,
        private registerService: RegisterService,
        private microtextService: MicrotextService,
        private eventService: EventService,
        private globalService: GlobalService,
        public snackbarService: SnackbarService) {
        this.validationFuncs = [
            {
                isFieldValid(user: User) {
                    user.username = user.username.trim();
                    return !!user.username;
                },
                errMsg: "Please enter username",
                fieldId: "register-username-micro",
                inputId: "register-username"
            },
            {
                isFieldValid(user: User) {
                    return !!user.password;
                },
                errMsg: "Please enter password",
                fieldId: "register-password-micro",
                inputId: "register-password"
            },
            {
                isFieldValid(user: User) {
                    return user.password.length >= 6;
                },
                errMsg: "Your password must be at least 6 characters long",
                fieldId: "register-password-micro",
                inputId: "register-password"
            }
        ];
    }

    ngOnInit() {
        this.user.username = this.globalService.getData("registerUsername") || "";
    }

    register() {
        if (this.microtextService.validation(this.validationFuncs, this.user)) {
            this.isLoading = true;

            this.registerService.register(this.user).then(data => {
                this.isLoading = false;
                let result = data ? data.result : null;

                if (result) {
                    this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                    this.router.navigateByUrl("/");
                }
                // In case the username is already exists.
                else if (result == false) {
                    $("#register-username-micro").html("The username is already in use");
                }
                else {
                    this.snackbarService.error();
                }
            });
        }
    }

    // Hide microtext in a specific field.
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