import { Component } from '@angular/core';

@Component({
    selector: 'users',
    templateUrl: './users.html',
    providers: [],
    styleUrls: ['./users.css']
})

export class UsersComponent {
    searchInput: string;
    users: Array<any> = [];

    isLoading: boolean = false;

    constructor() { }

    searchUser() {
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoading = true;
        }
    }

}