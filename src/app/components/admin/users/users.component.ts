import { Component } from '@angular/core';
import { UsersService } from 'src/app/services/admin/users.service';

@Component({
    selector: 'users',
    templateUrl: './users.html',
    providers: [UsersService],
    styleUrls: ['./users.css']
})

export class UsersComponent {
    searchInput: string;
    users: Array<any> = [];

    isLoading: boolean = false;

    constructor(private usersService: UsersService) { }

    searchUser() {
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoading = true;

            this.usersService.getUser(this.searchInput).then(results => {
                this.isLoading = false;
                let x = results;
            });
        }
    }

}