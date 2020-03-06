import { Component, OnDestroy } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { Request, METHOD } from '../../requestCard/requestCard.component'

@Component({
    selector: 'requests',
    templateUrl: './requests.html',
    providers: [],
    styleUrls: ['./requests.css']
})

export class RequestsComponent implements OnDestroy {
    isShowRequestCard: boolean = false;
    isShowRequestSettings: boolean = false;
    requestCards: Array<Request> = [];
    selectedRequest: Request;
    eventsIds: Array<string> = [];

    constructor(private eventService: EventService) {
        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD, (card: Request) => {
            this.requestCards.push(card);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowRequestCard = false;
            this.isShowRequestSettings = false;
            this.selectedRequest = null;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.DROP_REQUEST_CARD, (data: any) => {
            data.request = this.requestCards[data.requestIndex];
            this.eventService.emit(EVENT_TYPE.ADD_REQUEST_CARD_TO_MATRIX, data);
        }, this.eventsIds);

        let req1: Request = new Request();
        req1.name = "Test Get";
        req1.url = "127.0.0.1:5000/testGet?time=1000&success=true";
        req1.method = METHOD.GET;

        let req2: Request = new Request();
        req2.name = "Test Post";
        req2.url = "127.0.0.1:5000/testPost";
        req2.method = METHOD.POST;
        req2.body.template = '{"time": 1000, "success": true}';

        let req3: Request = new Request();
        req3.name = "Test Put";
        req3.url = "127.0.0.1:5000/testPut";
        req3.method = METHOD.PUT;
        req3.body.template = '{"time": 1000, "success": true}';

        let req4: Request = new Request();
        req4.name = "Test Delete";
        req4.url = "127.0.0.1:5000/testDelete?time=1000&success=true";
        req4.method = METHOD.DELETE;

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
        this.isShowRequestCard = true;
    }

}