import { Component, Input } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'report-matrix',
    templateUrl: './reportMatrix.html',
    styleUrls: ['./reportMatrix.css']
})

export class ReportMatrixComponent {

    constructor(private eventService: EventService) { }

}