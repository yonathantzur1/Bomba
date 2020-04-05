import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/global/auth.service';
import { CookieService } from 'src/app/services/global/cookie.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SocketService } from 'src/app/services/global/socket.service';

class Tab {
    name: string;
    url: string;
    isClicked: boolean;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
        this.isClicked = false;
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
    checkSocketConnectDelay: number = 3; // seconds

    tabs: Array<Tab>;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private cookieService: CookieService,
        private eventService: EventService,
        private globalService: GlobalService,
        private socketService: SocketService,
        private authService: AuthService) {
        this.eventService.register(EVENT_TYPE.TAB_CLICK, (url: string) => {
            this.tabClick(url, true);
        }, this.eventsIds);
    }

    ngOnInit() {
        this.socketService.socketEmit('login');

        this.checkSocketConnectInterval = setInterval(() => {
            if (!this.socketService.isSocketConnect()) {
                this.socketService.refreshSocket();
            }
        }, this.checkSocketConnectDelay * 1000);

        this.initializeTabs();
    }

    ngOnDestroy() {
        clearInterval(this.checkSocketConnectInterval);
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    initializeTabs() {
        this.tabs = [new Tab("Projects", "/"), new Tab("Reports", "/reports")];

        if (this.isAdmin) {
            this.tabs.push(new Tab("Users", "/users"));
            this.tabs.push(new Tab("Statistics", "/statistics"));
        }

        this.tabClick(this.router.url);
    }

    logout() {
        this.cookieService.deleteUidCookie();
        this.authService.deleteClientAuth();
        this.globalService.resetGlobalVariables();
        this.router.navigateByUrl("login");
    }

    navigateMain() {
        this.tabClick("/");
    }

    tabClick(url: string, preventNavigate?: boolean) {
        this.tabs.forEach((tab: Tab) => {
            tab.isClicked = (tab.url == url);
        });

        if (!preventNavigate) {
            this.router.navigateByUrl(url);
        }
    }
}