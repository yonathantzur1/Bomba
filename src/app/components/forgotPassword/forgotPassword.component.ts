import { Component, HostListener, Input } from '@angular/core';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';

@Component({
    selector: 'forgot-password',
    templateUrl: './forgotPassword.html',
    providers: [],
    styleUrls: ['./forgotPassword.css']
})

export class ForgotPasswordComponent {

    @Input() loginString: string;

    isLoading: boolean = false;
    validationFuncs: Array<InputFieldValidation>;

    constructor(private microtextService: MicrotextService) {
        this.validationFuncs = [
            {
                isFieldValid(loginString: string) {
                    loginString = loginString.trim();
                    return !!loginString;
                },
                errMsg: "Please enter username or email address",
                fieldId: "forgot-username-micro",
                inputId: "forgot-username"
            }
        ]
    }

    forgot() {
        if (this.microtextService.validation(this.validationFuncs, this.loginString)) {
            this.isLoading = true;
        }
    }

    // Hide microtext in a specific field.
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