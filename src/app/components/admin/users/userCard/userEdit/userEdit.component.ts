import { Component, Input, OnInit, HostListener } from '@angular/core';
import { UsersService } from 'src/app/services/admin/users.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';

declare const $: any;

export class UserEdit {
    id: string;
    username: string;
    password: string;

    constructor(id: string, username: string) {
        this.id = id;
        this.username = username;
    }
}

@Component({
    selector: 'user-edit',
    templateUrl: './userEdit.html',
    providers: [UsersService],
    styleUrls: ['./userEdit.css']
})

export class UserEditComponent implements OnInit {

    @Input() userId: string;
    @Input() username: string;

    userEdit: UserEdit;

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

    ngOnInit() {
        this.userEdit = new UserEdit(this.userId, this.username);
    }

    saveEdit() {
        if (this.microtextService.validation(this.validationFuncs, this.userEdit)) {
            this.usersService.saveUserEdit(this.userEdit).then(result => {
                if (result) {
                    this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                    this.eventService.emit(EVENT_TYPE.EDIT_USERNAME, this.userEdit.username);
                    this.snackbarService.snackbar("Edit user was succeeded");
                }
                else if (result == false) {
                    $("#edit-username-micro").html("The username is already in use");
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
            this.saveEdit();
        }
    }

}
