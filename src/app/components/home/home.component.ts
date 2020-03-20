import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/global/auth.service';

@Component({
    selector: 'home',
    templateUrl: './home.html',
    providers: [],
    styleUrls: ['./home.css']
})

export class HomeComponent {

    isLoading: boolean;
    isAdmin: boolean;

    constructor(private authService: AuthService) {
        this.isLoading = true;
        
        this.authService.isUserAdmin().then(isAdmin => {
            this.isLoading = false;
            this.isAdmin = isAdmin;
        });
    }
}