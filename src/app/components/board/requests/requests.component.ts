import { Component, OnDestroy, Input } from '@angular/core';
import { BoardService } from 'src/app/services/board.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { Request } from '../../requestCard/requestCard.component'
import { DefaultSettings } from '../../requestSettings/requestSettings.component'

@Component({
    selector: 'requests',
    templateUrl: './requests.html',
    providers: [],
    styleUrls: ['./requests.css']
})

export class RequestsComponent implements OnDestroy {

    @Input()
    projectId: string;

    @Input()
    requests: Array<Request>;

    isShowRequestCard: boolean = false;
    isShowRequestSettings: boolean = false;
    selectedRequest: Request;
    eventsIds: Array<string> = [];
    defaultSettings: DefaultSettings;

    constructor(private eventService: EventService,
        private boardService: BoardService) {
        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD, (card: Request) => {
            this.requests.push(card);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowRequestCard = false;
            this.isShowRequestSettings = false;
            this.selectedRequest = null;
            this.saveRequests();
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.DROP_REQUEST_CARD, (data: any) => {
            data.request = this.requests[data.requestIndex];
            this.eventService.emit(EVENT_TYPE.ADD_REQUEST_CARD_TO_MATRIX, data);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.SET_DEFAULT_REQUEST_SETTINGS,
            (defaultSettings: DefaultSettings) => {
                this.defaultSettings = defaultSettings;
            }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    openRequestEdit(requset: Request) {
        this.selectedRequest = requset;
        this.isShowRequestCard = true;
    }


    saveRequests() {
        this.boardService.saveRequests(this.projectId, this.requests);
    }
}