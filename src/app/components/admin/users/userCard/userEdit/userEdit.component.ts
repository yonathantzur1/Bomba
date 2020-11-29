import { Component, Input, HostListener } from '@angular/core';
import { UsersService } from 'src/app/services/admin/users.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';

declare const $: any;

export class UserEdit {
    id: string;
    username: string;
    email: string;
    password: string;

    constructor(id: string, username: string, email: string) {
        this.id = id;
        this.username = username;
        this.email = email;
    }
}

@Component({
    selector: 'user-edit',
    templateUrl: './userEdit.html',
    providers: [UsersService],
    styleUrls: ['./userEdit.css']
})

export class UserEditComponent {

    @Input() userEdit: UserEdit;

    isLoading: boolean = false;
    validationFuncs: Array<InputFieldValidation>;

    constructor(private eventService: EventService,
        private microtextService: MicrotextService,
        private snackbarService: SnackbarService,
        private usersService: UsersService) {
        this.validationFuncs = [
            {
                isFieldValid(user: UserEdit) {
                    user.username = user.username.trim();
                    return !!user.username;
                },
                errMsg: "Please enter username",
                fieldId: "edit-username-micro",
                inputId: "edit-username"
            },
            {
                isFieldValid(user: UserEdit) {
                    const usernameRegexp = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/;
                    return (usernameRegexp.test(user.username));
                },
                errMsg: "Username may only contain alphanumeric characters",
                fieldId: "register-username-micro",
                inputId: "register-username"
            },
            {
                isFieldValid(user: UserEdit) {
                    user.email = user.email.trim();
                    return !!user.email;
                },
                errMsg: "Please enter email address",
                fieldId: "register-email-micro",
                inputId: "register-email"
            },
            {
                isFieldValid(user: UserEdit) {
                    const emailRegexp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
                    return (emailRegexp.test(user.email));
                },
                errMsg: "Email address is invalid",
                fieldId: "register-email-micro",
                inputId: "register-email"
            },
            {
                isFieldValid(user: UserEdit) {
                    if (!user.password) {
                        return true;
                    }
                    else {
                        return (user.password.length >= 6);
                    }
                },
                errMsg: "Password must be at least 6 characters long",
                fieldId: "edit-password-micro",
                inputId: "edit-password"
            }
        ];
    }

    saveEdit() {
        if (this.microtextService.validation(this.validationFuncs, this.userEdit)) {
            this.isLoading = true;
            this.usersService.saveUserEdit(this.userEdit).then(data => {
                this.isLoading = false;
                const result = data ? data.result : null;

                if (!result) {
                    this.snackbarService.error();
                }
                else if (result == "-1") {
                    this.microtextService.showMicrotext("edit-username-micro",
                        "The username is already in use");
                }
                else if (result == "-2") {
                    this.microtextService.showMicrotext("edit-email-micro",
                        "The email is already in use");
                }
                else {
                    this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                    this.eventService.emit(EVENT_TYPE.EDIT_USERNAME, this.userEdit.username);
                    this.snackbarService.snackbar("Edit user was succeeded");
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
            this.saveEdit();
        }
    }

}
