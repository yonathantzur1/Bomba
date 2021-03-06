import { Component, OnInit, Input } from '@angular/core';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { MicrotextService } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ProjectApi } from '../apiManager.component';

enum API_ACTION {
    START,
    STOP
}

class Api {
    key: string;
    project: string;
    env: string;
    action: API_ACTION;

    constructor(key: string, project: string, env: string, action: API_ACTION) {
        this.key = key;
        this.project = project;
        this.env = env;
        this.action = action;
    }
}

@Component({
    selector: 'api-generator',
    templateUrl: './apiGenerator.html',
    styleUrls: ['./apiGenerator.css']
})

export class ApiGeneratorComponent implements OnInit {
    api: Api;
    apiAction: any = API_ACTION;
    isShowApiKey: boolean = false;

    @Input() apiKey: string;
    @Input() projects: Array<ProjectApi>;

    constructor(private eventService: EventService,
        private globalService: GlobalService,
        private snackbarService: SnackbarService,
        private microtextService: MicrotextService) {
    }

    ngOnInit() {
        this.api = new Api(this.apiKey, this.projects[0].name, null, API_ACTION.START);
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

    getSelectedProject() {
        return this.projects.find(project => project.name == this.api.project);
    }

    getApiRequest() {
        const apiRequest = this.getApiUrl() + "?" +
            "key=" + this.api.key + "&" +
            "project=" + this.api.project + "&" +
            (this.api.env ? ("env=" + this.api.env + "&") : '') +
            "action=" + this.api.action;

        this.globalService.copyToClipboard(encodeURI(apiRequest));
        this.closeWindow();
        this.snackbarService.snackbar("Copy successfully");
    }
}