import { Component, Input, OnDestroy } from '@angular/core';
import { Request } from 'src/app/components/requestCard/requestCard.component';
import { RequestResult } from 'src/app/components/board/matrix/matrix.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { Environment } from 'src/app/components/environments/environments.component';

@Component({
    selector: 'report-matrix',
    templateUrl: './reportMatrix.html',
    styleUrls: ['./reportMatrix.css']
})

export class ReportMatrixComponent implements OnDestroy {

    @Input() matrix: Request[][];
    @Input() results: { requestId: RequestResult };
    @Input() reqTimeout: number;
    @Input() envValues: any;

    selectedRequest: Request;
    requestEnvironment: Environment;

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService) {
        eventService.register(EVENT_TYPE.OPEN_REQUEST_VIEW, (request: Request) => {
            this.selectedRequest = request;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.selectedRequest = null;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }
}