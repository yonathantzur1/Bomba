import { Component, Input } from '@angular/core';
import { UsersService } from 'src/app/services/admin/users.service';
import { UserCard } from '../users.component';

@Component({
    selector: 'user-card',
    templateUrl: './userCard.html',
    providers: [UsersService],
    styleUrls: ['./userCard.css']
})

export class UserCardComponent {

    @Input() user: UserCard;

    isLoading: boolean = false;

    constructor(private usersService: UsersService) { }

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
