import { Component, Input } from '@angular/core';
import { Document } from '../../reportFolder.component';

@Component({
    selector: 'report-numbers',
    templateUrl: './reportNumbers.html',
    styleUrls: ['./reportNumbers.css']
})

export class ReportNumbersComponent {

    @Input() document: Document;

    constructor() { }

}