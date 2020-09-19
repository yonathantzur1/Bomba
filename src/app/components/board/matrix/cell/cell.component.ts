import { Component, Input } from '@angular/core';
import { Request } from '../../../requestCard/requestCard.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { RequestResult } from '../matrix.component';

@Component({
    selector: 'cell',
    templateUrl: './cell.html',
    styleUrls: ['./cell.css']
})

export class CellComponent {
    @Input() row: number;
    @Input() col: number;
    @Input() request: Request;
    @Input() result: RequestResult;
    @Input() isSendMode: boolean;
    @Input() maxRequestAmount: number;
    @Input() isLastCell: boolean;

    constructor(private eventService: EventService) { }

    deleteCell() {
        let i = this.row;
        let j = this.col;
        this.eventService.emit(EVENT_TYPE.DELETE_CELL, { i, j });
    }

    openRequestEdit() {
        this.eventService.emit(EVENT_TYPE.OPEN_REQUEST_EDIT, this.request);
    }

    getResultAverageTime() {
        if (this.result == null) {
            return null;
        }

        let resultsAmount = this.result.success + this.result.fail;
        return !!resultsAmount ? (this.result.time / resultsAmount).toFixed(2) : null;
    }

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