import { Component, Input } from '@angular/core';
import { Request } from '../../../requestCard/requestCard.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'cell',
    templateUrl: './cell.html',
    providers: [],
    styleUrls: ['./cell.css']
})

export class CellComponent {
    @Input()
    request: Request;

    @Input()
    row: number;

    @Input()
    col: number;

    constructor(private eventService: EventService) { }

    amountChanged() {
        this.eventService.emit(EVENT_TYPE.CHANGE_REQUEST_CARD_AMOUNT);
    }
}