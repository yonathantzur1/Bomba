import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

    constructor(private router: Router) {
        this.tabs = [new Tab("Projects", ""), new Tab("Admin", "admin")]
    }

    logout() {
        this.router.navigateByUrl("login");
    }

}