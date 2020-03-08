import { Component, OnDestroy } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'admin',
    templateUrl: './admin.html',
    providers: [],
    styleUrls: ['./admin.css']
})

export class AdminComponent implements OnDestroy {
    isShowRegister: boolean = true;
    eventsIds: Array<string> = [];

    constructor(private eventService: EventService) {
        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowRegister = false;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

}