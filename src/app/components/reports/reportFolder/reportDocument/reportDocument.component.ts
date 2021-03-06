import { Component, Input, OnInit } from '@angular/core';
import { Document } from '../reportFolder.component';
import { ReportsService } from 'src/app/services/reports.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { GlobalService } from 'src/app/services/global/global.service';

declare const $: any;

@Component({
    selector: 'report-document',
    templateUrl: './reportDocument.html',
    providers: [ReportsService],
    styleUrls: ['./reportDocument.css']
})

export class ReportDocumentComponent implements OnInit {

    @Input() document: Document;
    @Input() index: number;

    @Input() formatDate: Function;
    @Input() openDocument: Function;
    @Input() deleteDocument: Function;

    currDocumentName: string;
    reportNameMaxLength: number = 30;

    constructor(private reportsService: ReportsService,
        public globalService: GlobalService,
        private snackbarService: SnackbarService) { }

    ngOnInit() {
        this.currDocumentName = this.document.name;
    }

    restrictName(event: any) {
        if (event.key == "Enter") {
            event.target.blur();
            event.preventDefault();
        }
        else if (new RegExp('^.$').test(event.key) &&
            event.target.innerText.length > this.reportNameMaxLength - 1) {
            event.preventDefault();
        }
    }

    changeReportName(element: any) {
        const document: Document = this.document;
        const newName: string = element.innerText = element.innerText.trim();
        const isNameValid: boolean = newName.length <= this.reportNameMaxLength;

        if (!isNameValid) {
            element.innerText = document.name;
        }
        else {
            document.name = newName || null;
        }

        element.scrollLeft = 0;

        if (isNameValid && this.document.name != this.currDocumentName) {
            this.reportsService.setReportName(document._id, document.projectId, document.name).then(result => {
                if (!result) {
                    this.snackbarService.error();
                }
                else {
                    this.currDocumentName = this.document.name;
                }
            })
        };
    }

    openReportNameEdit(index: number) {
        this.document.name = "";

        setTimeout(() => {
            $("#report-" + index).focus();
        }, 0);
    }

}