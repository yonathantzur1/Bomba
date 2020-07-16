import { Component, OnDestroy } from '@angular/core';
import { ApiManagerService } from 'src/app/services/apiManager.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'api-manager',
    templateUrl: './apiManager.html',
    providers: [ApiManagerService],
    styleUrls: ['./apiManager.css']
})

export class ApiManagerComponent implements OnDestroy {

    isLoading: boolean;
    apiKey: string;
    projectsNames: Array<String>;
    isApiGenerator: boolean = true;

    eventsIds: Array<string> = [];

    constructor(private apiManagerService: ApiManagerService,
        private eventService: EventService,
        private snackbarService: SnackbarService) {

        let apiKeyQuery = this.apiManagerService.getApiKey();
        let userProjectsQuery = this.apiManagerService.getUserProjects();
        this.isLoading = true;

        Promise.all([apiKeyQuery, userProjectsQuery]).then((results: Array<any>) => {
            this.isLoading = false;
            
            if (results.filter(result => result == null).length > 0) {
                this.snackbarService.snackbar("Server error occurred");
            }
            else {
                this.apiKey = results[0].key;
                this.projectsNames = results[1];
            }
        });

        this.eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isApiGenerator = false;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    copyApiKey() {
        const textArea = document.createElement('textarea');
        textArea.value = this.apiKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.snackbarService.snackbar("Copy successfully");
    }

    openGenerator() {
        this.isApiGenerator = true;
    }

}