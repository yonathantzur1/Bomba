import { Component, OnInit, Input } from '@angular/core';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { MicrotextService } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { GlobalService } from 'src/app/services/global/global.service';

enum API_TYPE {
    START,
    STOP
}

class Api {
    key: string;
    project: string;
    type: API_TYPE;

    constructor(key: string, project: string, type: API_TYPE) {
        this.key = key;
        this.project = project;
        this.type = type;
    }
}

@Component({
    selector: 'api-generator',
    templateUrl: './apiGenerator.html',
    providers: [],
    styleUrls: ['./apiGenerator.css']
})

export class ApiGeneratorComponent implements OnInit {
    api: Api;
    apiType: any = API_TYPE;
    isShowApiKey: boolean = false;

    @Input() apiKey: string;
    @Input() projectsNames: Array<string>;

    constructor(private eventService: EventService,
        private alertService: AlertService,
        private globalService: GlobalService,
        private snackbarService: SnackbarService,
        private microtextService: MicrotextService) {
    }

    ngOnInit() {
        if (this.projectsNames.length == 0) {
            this.alertService.alert({
                title: "No Projects Found",
                text: "You have no projects to create API!\n" +
                    "First, create new project and then use our API.",
                type: ALERT_TYPE.INFO,
                showCancelButton: false,
                confirmBtnText: "OK"
            });

            this.closeWindow();
        }
        else {
            this.api = new Api(this.apiKey, this.projectsNames[0], API_TYPE.START);
        }
    }

    hideMicrotext(id: string) {
        this.microtextService.hideMicrotext(id);
    }

    showHideApiKey() {
        this.isShowApiKey = !this.isShowApiKey;
    }

    closeWindow() {
        this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
    }

    getApiUrl() {
        return document.location.origin + "/api/client";
    }

    getApiRequest() {
        let apiRequest = this.getApiUrl() + "/" +
            this.api.key + "/" +
            this.api.project + "/" +
            this.api.type;

        this.globalService.copyToClipboard(apiRequest);
        this.closeWindow();
        this.snackbarService.snackbar("Copy successfully");
    }
}