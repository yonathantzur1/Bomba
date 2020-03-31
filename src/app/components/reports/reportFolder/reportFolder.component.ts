import { Component, Input, OnInit } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

export class Document {
    _id: string;
    projectId: string;
    date: Date;
    success: number;
    fail: number;
    totalTime: number;
    requestAverageTime: number;
}

@Component({
    selector: 'report-folder',
    templateUrl: './reportFolder.html',
    providers: [ReportsService],
    styleUrls: ['./reportFolder.css']
})

export class ReportFolderComponent implements OnInit {

    @Input() projectId: string;
    @Input() projectName: string;

    isLoading: boolean = false;

    documents: Array<Document>;
    selectedDocument: Document;

    constructor(private reportsService: ReportsService,
        private eventService: EventService,
        private snackbarService: SnackbarService) { }

    ngOnInit() {
        this.isLoading = true;

        this.reportsService.getProjectReports(this.projectId).then(reportsData => {
            this.isLoading = false;

            if (reportsData) {
                this.documents = reportsData;
            }
            else {
                this.snackbarService.snackbar("Server error occurred");
                this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
            }
        });
    }

    formatDate(date: Date) {
        date = new Date(date);

        let hour: any = date.getHours();
        let minutes: any = date.getMinutes();
        let day: any = date.getDate();
        let month: any = date.getMonth() + 1;
        let year: any = date.getFullYear().toString().substr(-2);

        if (hour < 10) {
            hour = "0" + hour;
        }

        if (minutes < 10) {
            minutes = "0" + minutes;
        }

        if (day < 10) {
            day = "0" + day;
        }

        if (month < 10) {
            month = "0" + month;
        }

        return (day + '/' + month + '/' + year + " " + hour + ":" + minutes);
    }

    openDocument(document: Document) {
        this.selectedDocument = document;
    }

}