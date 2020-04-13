import { Component, OnDestroy } from '@angular/core';
import { UsersService } from 'src/app/services/admin/users.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

export class UserCard {
    _id: string;
    username: string;
    creationDate: Date;
    isAdmin: boolean;
    lastLoginTime: Date;
    projects: number;
}

@Component({
    selector: 'users',
    templateUrl: './users.html',
    providers: [UsersService],
    styleUrls: ['./users.css']
})

export class UsersComponent implements OnDestroy {
    searchInput: string;
    user: UserCard;

    isNotFound: boolean = false;
    isLoading: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private usersService: UsersService,
        private eventService: EventService) {
        this.eventService.register(EVENT_TYPE.DELETE_USER, () => {
            this.user = null;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    searchUser() {
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoading = true;
            this.isNotFound = false;
            this.user = null;

            this.usersService.getUser(this.searchInput).then(user => {
                this.isLoading = false;

                if (user) {
                    this.user = user;
                }
                else {
                    this.isNotFound = true;
                }
            });
        }
    }

}