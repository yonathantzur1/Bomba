import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

export class Document {
    _id: string;
    projectId: string;
    environment: string;
    name: string;
    date: Date;
    success: number;
    fail: number;
    totalTime: number;
    longestTime: number;
    requestAverageTime: number;
}

class EnvironmentFolder {
    name: string;
    documents: Array<Document>;

    constructor(name: string, documents: Array<Document>) {
        this.name = name;
        this.documents = documents;
    }
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

    isLoading: boolean = false;

    documents: Array<Document> = [];
    envFolders: Array<EnvironmentFolder> = [];
    selectedDocument: Document;
    selectedEnvFolder: EnvironmentFolder;

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

        this.reportsService.getProjectReports(this.projectId).then((docs: Array<Document>) => {
            this.isLoading = false;

            if (docs) {
                this.groupDocumentsByEnvironment(docs);
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

    getTitle() {
        let title = this.projectName + "  |  Reports";

        if (this.selectedEnvFolder) {
            title += "  |  " + this.selectedEnvFolder.name;
        }

        if (this.selectedDocument) {
            title += '  |  ' + this.formatDate(this.selectedDocument.date);

            if (this.selectedDocument.name) {
                title += "  (" + this.selectedDocument.name + ")";
            }
        }

        return title;
    }

    groupDocumentsByEnvironment(docs: Array<Document>) {
        let envDocs = {};

        docs.forEach((doc: Document) => {
            if (doc.environment) {
                if (envDocs[doc.environment]) {
                    envDocs[doc.environment].push(doc);
                }
                else {
                    envDocs[doc.environment] = [doc];
                }
            }
            else {
                this.documents.push(doc);
            }
        });

        Object.keys(envDocs).forEach(envName => {
            this.envFolders.push(new EnvironmentFolder(envName, envDocs[envName]));
        });
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

        return [day, month, year].join("/").concat(" - " + hour + ":" + minutes);
    }

    openDocument(document: Document) {
        this.selectedDocument = document;
    }

    deleteDocument(document: Document) {
        this.alertService.alert({
            title: "Delete Report",
            text: "Please confirm the deletion of the report " +
                (document.name ? '"' + document.name + '"' : '') + "\n" +
                "from: " + this.formatDate(document.date),
            type: ALERT_TYPE.DANGER,
            preConfirm: () => { return this.reportsService.deleteReport(this.projectId, document._id) },
            confirmFunc: (reportResult: any) => {
                if (reportResult) {
                    this.deleteReport(document._id, document.environment, this.projectId);
                }
                else {
                    this.snackbarService.snackbar("Server error occurred");
                }
            }
        });
    }

    deleteReport(docId: string, docEnv: string, projectId: string) {
        this.eventService.emit(EVENT_TYPE.DELETE_REPORT, this.projectId);
        const removeAction = (doc: Document) => {
            return doc._id != docId;
        };

        if (this.selectedEnvFolder) {
            this.selectedEnvFolder.documents = this.selectedEnvFolder.documents.filter(removeAction);

            if (this.selectedEnvFolder.documents.length == 0) {
                this.envFolders = this.envFolders.filter(folder => {
                    return folder.name != this.selectedEnvFolder.name;
                });

                this.backToMain();
            }
        }
        else {
            this.documents = this.documents.filter(removeAction);
        }

        if (this.documents.length == 0 && this.envFolders.length == 0) {
            this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
        }
    }

    openEnvFolder(envFolder: EnvironmentFolder) {
        this.selectedEnvFolder = envFolder;
    }

    backToMain() {
        this.selectedEnvFolder = null;
    }
}