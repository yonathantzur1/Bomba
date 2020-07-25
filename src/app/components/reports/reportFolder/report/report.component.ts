import { Component, Input } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'report',
    templateUrl: './report.html',
    styleUrls: ['./report.css']
})

export class ReportComponent {

    @Input() document: Document;

    constructor(private eventService: EventService) { }

    backToFolder() {
        this.eventService.emit(EVENT_TYPE.CLOSE_REPORT_DOCUMENT);
    }

    showResults() {

    }

}