import { Component, Input } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { Document } from '../reportFolder.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

@Component({
    selector: 'report',
    templateUrl: './report.html',
    providers: [ReportsService],
    styleUrls: ['./report.css']
})

export class ReportComponent {

    @Input() document: Document;
    isMatrixMode: boolean = false;
    reportData: any;

    constructor(private reportService: ReportsService,
        private snackbarService: SnackbarService,
        private eventService: EventService) { }

    backToFolder() {
        this.eventService.emit(EVENT_TYPE.CLOSE_REPORT_DOCUMENT);
    }

    showMatrix() {
        if (this.reportData) {
            this.isMatrixMode = true;
        }
        else {
            this.reportService.getReportData(this.document._id).then(result => {
                if (!result) {
                    this.snackbarService.snackbar("Server error occurred");
                }
                else {
                    this.reportData = result;
                }
            });
        }
    }

    showResults() {
        this.isMatrixMode = false;
    }

}