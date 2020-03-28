import { Component } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

class Report {
    projectId: string;
    projectName: string;
    amount: number;
}

@Component({
    selector: 'reports',
    templateUrl: './reports.html',
    providers: [ReportsService],
    styleUrls: ['./reports.css']
})

export class ReportsComponent {

    reports: Array<Report>;

    isLoading: boolean = false;

    constructor(private reportsService: ReportsService,
        private snackbarService: SnackbarService) {
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

}