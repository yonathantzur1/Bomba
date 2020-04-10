import { Component, Input, OnDestroy } from '@angular/core';
import { UsersService } from 'src/app/services/admin/users.service';
import { UserCard } from '../users.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'user-card',
    templateUrl: './userCard.html',
    providers: [UsersService],
    styleUrls: ['./userCard.css']
})

export class UserCardComponent implements OnDestroy {

    @Input() user: UserCard;

    isLoading: boolean = false;
    isEditMode: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService,
        private usersService: UsersService) {
        this.eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isEditMode = false;
        }, this.eventsIds);

        this.eventService.register(EVENT_TYPE.EDIT_USERNAME, (username: string) => {
            this.user.username = username;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    getInfoDateString(date: Date) {
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

}
