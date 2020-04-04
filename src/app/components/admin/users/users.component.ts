import { Component } from '@angular/core';
import { UsersService } from 'src/app/services/admin/users.service';

export class UserCard {
    _id: string;
    username: string;
    creationDate: Date;
    isAdmin: boolean;
    lastLoginTime: Date;
}

@Component({
    selector: 'users',
    templateUrl: './users.html',
    providers: [UsersService],
    styleUrls: ['./users.css']
})

export class UsersComponent {
    searchInput: string;
    user: UserCard;

    isNotFound: boolean = false;
    isLoading: boolean = false;

    constructor(private usersService: UsersService) { }

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