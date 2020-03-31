import { Component, Input } from '@angular/core';
import { Document } from '../reportFolder.component'


@Component({
    selector: 'report-document',
    templateUrl: './reportDocument.html',
    providers: [],
    styleUrls: ['./reportDocument.css']
})

export class ReportDocumentComponent {

    @Input() document: Document;

    constructor() { }

}