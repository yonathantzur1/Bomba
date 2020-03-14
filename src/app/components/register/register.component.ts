import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

import { RegisterService } from 'src/app/services/register.service';

import { User } from 'src/app/components/login/login.component';
import { GlobalService } from 'src/app/services/global/global.service';

declare let $: any;

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

                // In case of server error.
                if (result == null) {
                    this.snackbarService.snackbar("Server error occurred");
                }
                // In case the username is already exists.
                else if (result == false) {
                    // Show microtext of the username field. 
                    $("#register-username-micro").html("The username is already in use");
                }
                else {
                    this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                    this.router.navigateByUrl("/");
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
        if (event.code == "Enter") {
            this.register();
        }
    }
}