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
    user: any;

    constructor(private authService: AuthService,
        private globalService: GlobalService) {
        this.isLoading = true;

        this.authService.getCurrUser().then((user: any) => {
            this.user = user;
            this.isLoading = false;
        });

        this.globalService.userGuid = generateGuid();
    }
}