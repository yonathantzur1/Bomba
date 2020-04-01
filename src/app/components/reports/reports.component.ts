import { Component, OnDestroy } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

class Report {
    projectId: string;
    projectName: string;
    amount: number;
}

class FolderData {
    projectId: string;
    projectName: string;

    constructor(projectId: string, projectName: string) {
        this.projectId = projectId;
        this.projectName = projectName;
    }
}

@Component({
    selector: 'reports',
    templateUrl: './reports.html',
    providers: [ReportsService],
    styleUrls: ['./reports.css']
})

export class ReportsComponent implements OnDestroy {

    reports: Array<Report>;
    folderData: FolderData;

    isLoading: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private reportsService: ReportsService,
        private eventService: EventService,
        private snackbarService: SnackbarService) {

        this.eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.folderData = null;
        }, this.eventsIds);

        this.eventService.register(EVENT_TYPE.EMPTY_REPORT_FOLDER, (projectId: string) => {
            this.reports = this.reports.filter((report: Report) => {
                return report.projectId != projectId;
            });
        }, this.eventsIds);

        this.isLoading = true;

        this.reportsService.getAllReports().then(reports => {
            this.isLoading = false;

            if (reports) {
                this.reports = reports;
            }
            else {
                this.snackbarService.snackbar("Server error occurred")
            }
        });
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    openFolder(report: Report) {
        this.folderData = new FolderData(report.projectId, report.projectName);
    }

}