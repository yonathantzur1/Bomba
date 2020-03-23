import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/global/auth.service';
import { CookieService } from 'src/app/services/global/cookie.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { SOCKET_STATE } from 'src/app/enums';

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

export class NavbarComponent implements OnInit, OnDestroy {

    @Input() isAdmin: boolean;

    checkSocketConnectInterval: any;
    checkSocketConnectDelay: number = 10; // seconds

    tabs: Array<Tab>;

    constructor(private router: Router,
        private cookieService: CookieService,
        private globalService: GlobalService,
        private socketService: SocketService,
        private authService: AuthService) { }

    ngOnInit() {
        this.socketService.socketEmit('login');

        let self = this;

        self.checkSocketConnectInterval = setInterval(() => {
            self.authService.isUserSocketConnect().then((result: any) => {
                if (result) {
                    switch (result.state) {
                        case SOCKET_STATE.ACTIVE:
                            break;
                        // In case the user is login with no connected socket.
                        case SOCKET_STATE.CLOSE:
                            self.socketService.refreshSocket();
                            break;
                        // In case the user is logout.
                        case SOCKET_STATE.LOGOUT:
                            self.logout();
                            break;
                    }
                }
            });
        }, self.checkSocketConnectDelay * 1000);

        this.tabs = [new Tab("Projects", ""), new Tab("Reports", "reports")];

        if (this.isAdmin) {
            this.tabs.push(new Tab("Admin", "admin"));
        }
    }

    ngOnDestroy() {
        clearInterval(this.checkSocketConnectInterval);
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