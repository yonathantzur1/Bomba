import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/global/auth.service';
import { CookieService } from 'src/app/services/global/cookie.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SocketService } from 'src/app/services/global/socket.service';

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

export class NavbarComponent implements OnInit {
    @Input()
    isAdmin: boolean;

    tabs: Array<Tab>;

    constructor(private router: Router,
        private cookieService: CookieService,
        private globalService: GlobalService,
        private socketService: SocketService,
        private authService: AuthService) { }

    ngOnInit() {
        this.socketService.socketEmit('login');
        this.tabs = [new Tab("Projects", ""), new Tab("Reports", "reports")];

        if (this.isAdmin) {
            this.tabs.push(new Tab("Admin", "admin"));
        }
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

    tabClick(url: string) {
        this.router.navigateByUrl(url);
    }
}