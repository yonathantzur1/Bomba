import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { DefaultSettings } from '../requestSettings/requestSettings.component';
import { METHOD } from 'src/app/enums';
import { Tab } from './requestNavbar/requestNavbar.component';
import { generateGuid } from 'src/app/globals';
import { Environment } from '../environments/environments.component';

export class Request {
    id: string;
    name: string;
    method: METHOD;
    url: string;
    body: string;
    headers: any; // json
    cookies: any; // json
    amount: number;
    isEmpty: boolean;

    constructor(isEmpty?: boolean) {
        this.isEmpty = !!isEmpty;

        if (!this.isEmpty) {
            this.generateGuid();
            this.name = "";
            this.method = METHOD.GET;
            this.url = "";
            this.body = "";
            this.headers = {};
            this.cookies = {};
            this.amount = 1;
        }
    }

    copy(request: any) {
        if (request.isEmpty) {
            this.isEmpty = !!request.isEmpty;
        }
        else {
            this.id = request.id;
            this.name = request.name;
            this.method = request.method;
            this.url = request.url;
            this.body = request.body;
            this.headers = Object.assign({}, request.headers);
            this.cookies = Object.assign({}, request.cookies);
            this.amount = request.amount;
        }

        return this;
    }

    generateGuid() {
        this.id = generateGuid();
    }
}

@Component({
    selector: 'request-card',
    templateUrl: './requestCard.html',
    styleUrls: ['./requestCard.css']
})

export class RequestCardComponent implements OnInit, OnDestroy {

    @Input() selectedRequest: Request;
    @Input() defaultSettings: DefaultSettings;
    @Input() environment: Environment;

    request: Request;
    tabs: Array<Tab>;
    validationFuncs: Array<InputFieldValidation>;
    method: any = METHOD;

    isTestRequest: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private microtextService: MicrotextService,
        private eventService: EventService) {
        this.tabs = [
            new Tab("Body", true),
            new Tab("Headers", false),
            new Tab("Cookies", false)
        ];

        this.validationFuncs = [
            {
                isFieldValid(request: Request) {
                    request.name = request.name.trim();
                    return !!request.name;
                },
                errMsg: "Please enter name for request",
                fieldId: "name-micro",
                inputId: "name"
            },
            {
                isFieldValid(request: Request) {
                    request.url = request.url.trim();
                    return !!request.url;
                },
                errMsg: "Please enter request url",
                fieldId: "url-micro",
                inputId: "url"
            },
            {
                isFieldValid(request: Request) {
                    return !request.url.includes(" ");
                },
                errMsg: "The request url is not valid",
                fieldId: "url-micro",
                inputId: "url"
            }
        ];

        this.eventService.register(EVENT_TYPE.CLOSE_TEST_REQUEST, () => {
            this.isTestRequest = false;
        }, this.eventsIds);
    }

    ngOnInit() {
        if (this.selectedRequest) {
            this.request = JSON.parse(JSON.stringify(this.selectedRequest));
        }
        else {
            this.request = new Request();
            this.setDefaultSettings();
        }
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    setDefaultSettings() {
        if (this.defaultSettings.url) {
            this.request.url = this.defaultSettings.url;
        }

        if (this.defaultSettings.method && this.defaultSettings.method != METHOD.DEFAULT) {
            this.request.method = this.defaultSettings.method;
        }
    }

    validateRequest() {
        return this.microtextService.validation(this.validationFuncs, this.request);
    }

    validateTestRequest() {
        const testValidations = this.validationFuncs.filter(validation => {
            return validation.inputId != "name";
        });

        return this.microtextService.validation(testValidations, this.request);
    }

    addRequest() {
        if (this.validateRequest()) {
            // In case the request is in edit mode.
            if (this.selectedRequest) {
                this.copyRequest(this.selectedRequest, this.request)
            }
            else {
                this.eventService.emit(EVENT_TYPE.ADD_REQUEST_CARD, this.request);
            }

            this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
            this.eventService.emit(EVENT_TYPE.SAVE_REQUEST_CARD);
        }
    }

    copyRequest(src: Request, dst: Request) {
        Object.keys(dst).forEach(key => {
            src[key] = dst[key];
        });
    }

    testRequest() {
        if (this.validateTestRequest()) {
            this.isTestRequest = true;
        }
    }

    hideMicrotext(id: string) {
        this.microtextService.hideMicrotext(id);
    }
}