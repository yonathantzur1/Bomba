import { Component, Input } from '@angular/core';
import { Request } from '../../../requestCard/requestCard.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'cell',
    templateUrl: './cell.html',
    styleUrls: ['./cell.css']
})

export class CellComponent {
    @Input() request: Request;
    @Input() row: number;
    @Input() col: number;
    @Input() isSendMode: boolean;
    @Input() maxRequestAmount: number;

    constructor(private eventService: EventService) { }

    amountChanged() {
        if (!this.request.amount || this.request.amount < 0) {
            this.request.amount = 1;
        }
        else {
            this.request.amount = Math.min(this.request.amount, this.maxRequestAmount);
        }

        this.eventService.emit(EVENT_TYPE.CHANGE_REQUEST_CARD_AMOUNT);
    }
}