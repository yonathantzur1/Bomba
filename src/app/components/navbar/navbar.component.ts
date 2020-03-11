import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/global/auth.service';

class Tab {
    name: string;
    url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}

@Component({
    selector: 'navbar',
    templateUrl: './navbar.html',
    providers: [],
    styleUrls: ['./navbar.css']
})

export class NavbarComponent {

    tabs: Array<Tab>;

    constructor(private router: Router, private authService: AuthService) {
        this.tabs = [new Tab("Projects", ""), new Tab("Admin", "admin")]
    }

    async logout() {
        await this.authService.deleteClientAuth();
        this.router.navigateByUrl("login");
    }

}