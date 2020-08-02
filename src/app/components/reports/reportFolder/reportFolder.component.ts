import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

export class Document {
    _id: string;
    projectId: string;
    name: string;
    date: Date;
    success: number;
    fail: number;
    totalTime: number;
    longestTime: number;
    requestAverageTime: number;
}

@Component({
    selector: 'report-folder',
    templateUrl: './reportFolder.html',
    providers: [ReportsService],
    styleUrls: ['./reportFolder.css']
})

export class ReportFolderComponent implements OnInit, OnDestroy {

    @Input() projectId: string;
    @Input() projectName: string;

    reportNameMaxLength: number = 30;

    isLoading: boolean = false;

    documents: Array<Document>;
    selectedDocument: Document;

    eventsIds: Array<string> = [];

    constructor(private reportsService: ReportsService,
        private alertService: AlertService,
        private eventService: EventService,
        private snackbarService: SnackbarService) {
        this.eventService.register(EVENT_TYPE.CLOSE_REPORT_DOCUMENT, () => {
            this.selectedDocument = null;
        }, this.eventsIds);
    }

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

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    formatDate(date: Date) {
        date = new Date(date);

        let hour: any = date.getHours();
        let minutes: any = date.getMinutes();
        let day: any = date.getDate();
        let month: any = date.getMonth() + 1;
        const year: any = date.getFullYear().toString().substr(-2);

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

    deleteDocument(position: number) {
        const document: Document = this.documents[position];

        this.alertService.alert({
            title: "Delete Report",
            text: "Please confirm the deletion of the report" + "\n" +
                "from: " + this.formatDate(document.date),
            type: ALERT_TYPE.DANGER,
            preConfirm: this.reportsService.deleteReport(this.projectId, document._id),
            confirmFunc: (reportResult: any) => {
                if (reportResult) {
                    this.documents.splice(position, 1);
                    this.eventService.emit(EVENT_TYPE.DELETE_REPORT, this.projectId);

                    if (this.documents.length == 0) {
                        this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                    }
                }
                else {
                    this.snackbarService.snackbar("Server error occurred");
                }
            }
        });
    }

    restrictName(event: any) {
        if (event.code == "Enter") {
            event.target.blur();
            event.preventDefault();
        }
        else if (new RegExp('^[A-Za-zא-ת0-9]$').test(event.key) &&
            event.target.innerText.length > this.reportNameMaxLength - 1) {
            event.preventDefault();
        }
    }

    changeReportName(element: any, index: number) {
        const document = this.documents[index];
        const newName = element.innerText;
        const isNameValid = newName.length > 0 && newName.length <= this.reportNameMaxLength;

        if (!isNameValid) {
            element.innerText = document.name;
        }
        else {
            document.name = newName;
        }

        element.scrollLeft = 0;

        isNameValid && this.reportsService.setReportName(document._id, document.projectId, document.name).then(result => {
            if (!result) {
                this.snackbarService.snackbar("Error while saving report name");
            }
        });
    }
}