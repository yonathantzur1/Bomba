import { Component, OnDestroy } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { InfoCard } from './info/infoCard/infoCard.component';

@Component({
    selector: 'admin',
    templateUrl: './admin.html',
    providers: [],
    styleUrls: ['./admin.css']
})

export class AdminComponent implements OnDestroy {
    usersInfoCards: Array<InfoCard>;
    statisticsInfoCards: Array<InfoCard>;
    isShowRegister: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService) {
        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowRegister = false;
        }, this.eventsIds);

        this.usersInfoCards = [new InfoCard("Users", "15"), new InfoCard("Admins", "2")];
        this.statisticsInfoCards = [new InfoCard("Projects", "15")];
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

}