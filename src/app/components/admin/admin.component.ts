import { Component } from '@angular/core';
import { InfoCard } from './info/infoCard/infoCard.component';

@Component({
    selector: 'admin',
    templateUrl: './admin.html',
    providers: [],
    styleUrls: ['./admin.css']
})

export class AdminComponent {
    usersInfoCards: Array<InfoCard>;
    statisticsInfoCards: Array<InfoCard>;

    eventsIds: Array<string> = [];

    constructor() {
        this.usersInfoCards = [new InfoCard("Users", "15"), new InfoCard("Admins", "2")];
        this.statisticsInfoCards = [new InfoCard("Projects", "15")];
    }

}