import { Component, OnDestroy } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { Request } from '../../requestCard/requestCard.component'

@Component({
    selector: 'requests',
    templateUrl: './requests.html',
    providers: [],
    styleUrls: ['./requests.css']
})

export class RequestsComponent implements OnDestroy {
    isShowNewRequestCard: boolean = false;
    requestCards: Array<Request> = [];
    selectedRequest: Request;
    eventsIds: Array<string> = [];

    constructor(private eventService: EventService) {
        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD, (card: Request) => {
            this.requestCards.push(card);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_REQUEST_CARD, () => {
            this.isShowNewRequestCard = false;
            this.selectedRequest = null;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.DROP_REQUEST_CARD, (data: any) => {
            data.request = this.requestCards[data.requestIndex];
            this.eventService.emit(EVENT_TYPE.ADD_REQUEST_CARD_TO_MATRIX, data);
        }, this.eventsIds);

        let req1: Request = new Request();
        req1.name = "Check Hierarchy 1";
        req1.url = "127.0.0.1:9000/Query";

        let req2: Request = new Request();
        req2.name = "Check Hierarchy 2";
        req2.url = "127.0.0.1:9000/Query";

        let req3: Request = new Request();
        req3.name = "Check Hierarchy 3";
        req3.url = "127.0.0.1:9000/Query";

        let req4: Request = new Request();
        req4.name = "Check Hierarchy 4";
        req4.url = "127.0.0.1:9000/Query";

        this.requestCards.push(req1);
        this.requestCards.push(req2);
        this.requestCards.push(req3);
        this.requestCards.push(req4);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    openRequestEdit(requset: Request) {
        this.selectedRequest = requset;
        this.isShowNewRequestCard = true;
    }

}