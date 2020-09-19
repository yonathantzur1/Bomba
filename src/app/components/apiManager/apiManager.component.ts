import { Component, OnDestroy } from '@angular/core';
import { ApiManagerService } from 'src/app/services/apiManager.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

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
        private eventService: EventService,
        private snackbarService: SnackbarService) {

        let apiKeyQuery = this.apiManagerService.getApiKey();
        let userProjectsQuery = this.apiManagerService.getProjectsForApi();
        this.isLoading = true;

        Promise.all([apiKeyQuery, userProjectsQuery]).then((results: Array<any>) => {
            this.isLoading = false;

            if (results.filter(result => result == null).length > 0) {
                this.snackbarService.snackbar("Server error occurred");
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
        this.isApiGenerator = true;
    }

}