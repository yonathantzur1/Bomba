import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ForgotPasswordService } from 'src/app/services/forgotPassword.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { MicrotextService, InputValidation } from 'src/app/services/global/microtext.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

@Component({
    selector: 'forgot-password',
    templateUrl: './forgotPassword.html',
    providers: [ForgotPasswordService],
    styleUrls: ['./forgotPassword.css']
})

export class ForgotPasswordComponent {

    username: string = "";
    isLoading: boolean = false;
    validations: Array<InputValidation>;

    constructor(private router: Router,
        private microtextService: MicrotextService,
        private eventService: EventService,
        private alertService: AlertService,
        private snackbarService: SnackbarService,
        private forgotPasswordService: ForgotPasswordService) {
        this.validations = [
            {
                isFieldValid(username: string) {
                    username = username.trim();
                    return !!username;
                },
                errMsg: "Please enter username or email address",
                fieldId: "forgot-username-micro",
                inputId: "forgot-username"
            }
        ]
    }

    forgot() {
        if (this.microtextService.validation(this.validations, this.username)) {
            this.isLoading = true;
            this.forgotPasswordService.restorePassword(this.username).then(result => {
                this.isLoading = false;

                if (!result) {
                    return this.snackbarService.error();
                }

                this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                this.alertService.alert({
                    title: "Reset Password",
                    text: "If we found an account associated with that username, " +
                        "we've sent password reset instructions to the " +
                        "email address on the account.",
                    type: ALERT_TYPE.INFO,
                    showCancelButton: false,
                    confirmBtnText: "OK",
                    confirmFunc: () => {
                        this.router.navigateByUrl("/");
                    }
                });

            });
        }
    }

    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.key == "Enter") {
            this.forgot();
        }
    }

}