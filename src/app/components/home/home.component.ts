import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/global/auth.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { generateGuid } from 'src/app/globals';

@Component({
    selector: 'home',
    templateUrl: './home.html',
    styleUrls: ['./home.css']
})

export class HomeComponent {

    isLoading: boolean;
    currUser: any;
    isAdmin: boolean;

    constructor(private authService: AuthService,
        private globalService: GlobalService) {
        this.isLoading = true;

        this.authService.getCurrUser().then((user: any) => {
            this.currUser = user;
        });

        this.authService.isUserAdmin().then(isAdmin => {
            this.isLoading = false;
            this.isAdmin = isAdmin;
        });

        this.globalService.userGuid = generateGuid();
    }
}