import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/global/auth.service';
import { CookieService } from 'src/app/services/global/cookie.service';
import { GlobalService } from 'src/app/services/global/global.service';

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

    constructor(private router: Router,
        private cookieService: CookieService,
        private globalService: GlobalService,
        private authService: AuthService) {
        this.tabs = [new Tab("Projects", ""), new Tab("Admin", "admin")]
    }

    logout() {
        this.cookieService.deleteUidCookie();
        this.authService.deleteClientAuth();
        this.globalService.resetGlobalVariables();
        this.router.navigateByUrl("login");
    }

    navigateMain() {
        this.router.navigateByUrl("/");
    }
}