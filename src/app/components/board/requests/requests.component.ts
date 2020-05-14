import { Component, OnDestroy, Input } from '@angular/core';
import { BoardService } from 'src/app/services/board.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { Request } from '../../requestCard/requestCard.component'
import { DefaultSettings } from '../../requestSettings/requestSettings.component'
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

@Component({
    selector: 'requests',
    templateUrl: './requests.html',
    providers: [],
    styleUrls: ['./requests.css']
})

export class RequestsComponent implements OnDestroy {

    @Input() projectId: string;
    @Input() requests: Array<Request>;
    @Input() defaultSettings: DefaultSettings;

    isShowRequestCard: boolean = false;
    isShowRequestSettings: boolean = false;
    selectedRequest: Request;
    eventsIds: Array<string> = [];

    constructor(private eventService: EventService,
        private globalService: GlobalService,
        public socketService: SocketService,
        private alertService: AlertService,
        private boardService: BoardService) {

        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD, (card: Request) => {
            this.requests.push(card);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.SAVE_REQUEST_CARD, () => {
            this.saveRequests();
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowRequestCard = false;
            this.isShowRequestSettings = false;
            this.selectedRequest = null;
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
        this.socketService.socketEmit('selfSync',
            'syncRequests',
            {
                "userGuid": this.globalService.userGuid,
                "projectId": this.projectId,
                "requests": this.requests
            });
    }

    deleteRequest(index: number, event: any) {
        event.stopPropagation();

        this.alertService.alert({
            title: "Delete Request",
            text: 'Please confirm deletion of the request "' + this.requests[index].name + '"\n\n' +
                "The action will delete all data saved on the request.",
            type: ALERT_TYPE.DANGER,
            confirmFunc: () => {
                this.requests.splice(index, 1);
                this.saveRequests();
            }
        });
    }
}