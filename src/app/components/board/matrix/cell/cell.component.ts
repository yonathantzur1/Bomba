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

    deleteRequest() {
        this.eventService.emit(EVENT_TYPE.REMOVE_REQUEST, { col: this.col, row: this.row });
    }
}