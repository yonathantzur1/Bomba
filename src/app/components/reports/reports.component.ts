import { Component, OnDestroy } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { ContextMenu, MenuItem } from '../contextMenu/contextMenu.component';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

class Report {
    projectId: string;
    projectName: string;
    reportsAmount: number;
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
    contextMenu: ContextMenu;
    contextMenuItems: Array<MenuItem>;

    isLoading: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private reportsService: ReportsService,
        private alertService: AlertService,
        private eventService: EventService,
        private snackbarService: SnackbarService) {

        eventService.register(EVENT_TYPE.CLOSE_CONTEXT_MENU, () => {
            this.contextMenu = null;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_REPORT_FOLDER, () => {
            this.folderData = null;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.DELETE_REPORT, this.deleteReport.bind(this), this.eventsIds);

        this.contextMenuItems = [
            new MenuItem("Open", "far fa-folder-open", (projectId: string) => {
                const report = this.reports.find(report => report.projectId == projectId);
                this.openFolder(report);
            }),
            new MenuItem("Delete", "far fa-trash-alt", this.deleteFolder.bind(this))
        ];

        this.isLoading = true;

        this.reportsService.getAllReports().then(reports => {
            this.isLoading = false;

            if (reports) {
                this.reports = reports;
            }
            else {
                this.snackbarService.error()
            }
        });
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    openFolder(report: Report) {
        this.folderData = new FolderData(report.projectId, report.projectName);
    }

    openContextMenu(event: any, projectId: string) {
        event.preventDefault();
        this.contextMenu = new ContextMenu(event.clientX, event.clientY + 10, projectId);
    }

    deleteReport(projectId: string) {
        this.reports = this.reports.filter(report => {
            if (report.projectId == projectId && (--report.reportsAmount == 0)) {
                return false;
            }

            return true;
        });
    }

    deleteFolder(projectId: string) {
        const projectName = this.reports.find(report => report.projectId == projectId).projectName;

        this.alertService.alert({
            title: "Delete Folder",
            text: "Please confirm the deletion of the folder \n'" + projectName + "'",
            type: ALERT_TYPE.DANGER,
            preConfirm: () => { return this.reportsService.deleteFolder(projectId) },
            confirmFunc: (result: any) => {
                if (result) {
                    this.reports = this.reports.filter(report => report.projectId != projectId);
                }
                else {
                    this.snackbarService.error();
                }
            }
        });
    }
}