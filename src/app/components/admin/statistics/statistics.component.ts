import { Component } from '@angular/core';
import { InfoCard } from './info/infoCard/infoCard.component';

@Component({
    selector: 'statistics',
    templateUrl: './statistics.html',
    providers: [],
    styleUrls: ['./statistics.css']
})

export class StatisticsComponent {
    usersInfoCards: Array<InfoCard>;
    statisticsInfoCards: Array<InfoCard>;

    eventsIds: Array<string> = [];

    constructor() {
        this.usersInfoCards = [new InfoCard("Users", "15"), new InfoCard("Admins", "2")];
        this.statisticsInfoCards = [new InfoCard("Projects", "15")];
    }

}