import { Component } from '@angular/core';
import { InfoCard } from './info/infoCard/infoCard.component';
import { StatisticsService } from 'src/app/services/admin/statistics.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

@Component({
    selector: 'statistics',
    templateUrl: './statistics.html',
    providers: [StatisticsService],
    styleUrls: ['./statistics.css']
})

export class StatisticsComponent {
    usersInfoCards: Array<InfoCard>;
    statisticsInfoCards: Array<InfoCard>;

    isLoading: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private statisticsService: StatisticsService,
        private snackbarService: SnackbarService) {
        this.isLoading = true;

        this.statisticsService.getStatistics().then(result => {
            this.isLoading = false;

            if (result) {
                this.usersInfoCards = [
                    new InfoCard("Users", result.users),
                    new InfoCard("Admins", result.admins)
                ];

                this.statisticsInfoCards = [
                    new InfoCard("Projects", result.projects),
                    new InfoCard("Reports", result.reports)
                ];
            }
            else {
                this.snackbarService.error();
            }
        });
    }

}