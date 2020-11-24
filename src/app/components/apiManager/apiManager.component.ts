import { Component, OnDestroy } from '@angular/core';
import { ApiManagerService } from 'src/app/services/apiManager.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

export class ProjectApi {
    name: string;
    environments: Array<string>;

    constructor(name: string, environments: Array<string>) {
        this.name = name;
        this.environments = environments;
    }
}

@Component({
    selector: 'api-manager',
    templateUrl: './apiManager.html',
    providers: [ApiManagerService],
    styleUrls: ['./apiManager.css']
})

export class ApiManagerComponent implements OnDestroy {

    title: string = "Bomba {API}";
    isLoading: boolean;
    apiKey: string;
    projects: Array<any>;
    isApiGenerator: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private apiManagerService: ApiManagerService,
        private alertService: AlertService,
        private eventService: EventService,
        private snackbarService: SnackbarService) {

        const apiKeyQuery = this.apiManagerService.getApiKey();
        const userProjectsQuery = this.apiManagerService.getProjectsForApi();
        this.isLoading = true;

        Promise.all([apiKeyQuery, userProjectsQuery]).then((results: Array<any>) => {
            this.isLoading = false;

            if (results.filter(result => result == null).length > 0) {
                this.snackbarService.error();
            }
            else {
                this.apiKey = results[0].key;
                this.projects = results[1];
            }
        });

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isApiGenerator = false;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    openGenerator() {
        if (this.projects.length > 0) {
            this.isApiGenerator = true;
        }
        else {
            this.alertService.alert({
                title: "No Projects Found",
                text: "You have no projects.\n" +
                    "First, create new project and then use our API.",
                type: ALERT_TYPE.INFO,
                showCancelButton: false,
                confirmBtnText: "OK"
            });
        }
    }

}