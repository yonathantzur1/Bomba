import { Component, Input } from '@angular/core';
import { Document } from '../reportFolder.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'report-document',
    templateUrl: './reportDocument.html',
    styleUrls: ['./reportDocument.css']
})

export class ReportDocumentComponent {

    @Input() document: Document;

    constructor(private eventService: EventService) { }

    backToFolder() {
        this.eventService.emit(EVENT_TYPE.CLOSE_REPORT_DOCUMENT);
    }

}