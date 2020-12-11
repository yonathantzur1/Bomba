import { Component, Input, OnDestroy } from '@angular/core';
import { UsersService } from 'src/app/services/admin/users.service';
import { UserCard } from '../users.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { UserEdit } from './userEdit/userEdit.component';

@Component({
    selector: 'user-card',
    templateUrl: './userCard.html',
    providers: [UsersService],
    styleUrls: ['./userCard.css']
})

export class UserCardComponent implements OnDestroy {

    @Input() user: UserCard;

    isLoading: boolean = false;
    userEdit: UserEdit;

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService,
        private alertService: AlertService,
        private socketService: SocketService,
        private snackbarService: SnackbarService,
        private usersService: UsersService) {
        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.userEdit = null;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.EDIT_USER, (userEdit: UserEdit) => {
            this.user.username = userEdit.username;
            this.user.email = userEdit.email;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    getInfoDateString(date: Date) {
        if (!date) {
            return "-"
        }

        let dateObj = new Date(date);

        let dateString = (dateObj.getDate()) + "/" +
            (dateObj.getMonth() + 1) + "/" +
            dateObj.getFullYear();

        let HH = dateObj.getHours().toString();
        let mm = dateObj.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        let timeString = (HH + ":" + mm);

        return (dateString + " - " + timeString);
    }

    changeAdminStatus() {
        this.user.isAdmin = !this.user.isAdmin;
        this.usersService.changeAdminStatus(this.user._id, this.user.isAdmin);
    }

    editUser() {
        this.userEdit = new UserEdit(this.user._id, this.user.username, this.user.email);
    }

    deleteUser() {
        this.alertService.alert({
            title: "Delete User",
            text: 'Please confirm the deletion of the user "' + this.user.username + '"\n\n' +
                "The action will delete all data saved for the user including his projects and reports.",
            type: ALERT_TYPE.DANGER,
            preConfirm: () => {
                return this.usersService.deleteUser(this.user._id);
            },
            confirmFunc: (result: boolean) => {
                if (!result) {
                    return this.snackbarService.error();
                }

                this.snackbarService.snackbar(this.user.username + " was deleted");
                this.eventService.emit(EVENT_TYPE.DELETE_USER);

                let logoutMsg = "Your account has been deleted." +
                    "{{enter}}" +
                    "For further details, please contact website admin.";

                this.socketService.socketEmit("LogoutUserSessionServer",
                    logoutMsg,
                    this.user._id);
            }
        })
    }

}
