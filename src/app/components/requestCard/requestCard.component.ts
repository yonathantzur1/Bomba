import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MicrotextService, InputValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { DefaultSettings } from '../requestSettings/requestSettings.component';
import { METHOD } from 'src/app/enums';
import { Tab } from './requestNavbar/requestNavbar.component';
import { generateGuid } from 'src/app/globals';

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
    @Input() defaultSettings: DefaultSettings = new DefaultSettings();
    @Input() envValues: any;
    @Input() isDisabled: boolean = false;

    request: Request;
    tabs: Array<Tab>;
    validations: Array<InputValidation>;
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

        this.validations = [
            {
                isFieldValid(request: Request) {
                    request.name = request.name.trim();
                    return !!request.name;
                },
                errMsg: "Please enter name for request.",
                fieldId: "name-micro",
                inputId: "name"
            },
            {
                isFieldValid(request: Request) {
                    request.url = request.url.trim();
                    return !!request.url;
                },
                errMsg: "Please enter request url.",
                fieldId: "url-micro",
                inputId: "url"
            },
            {
                isFieldValid(request: Request) {
                    return !request.url.includes(" ");
                },
                errMsg: "The request url is not valid.",
                fieldId: "url-micro",
                inputId: "url"
            }
        ];

        eventService.register(EVENT_TYPE.CLOSE_TEST_REQUEST, () => {
            this.isTestRequest = false;
        }, this.eventsIds);
    }

    ngOnInit() {
        if (this.isDisabled && this.envValues) {
            this.selectedRequest = JSON.parse(JSON.stringify(this.selectedRequest));
            this.setEnvironmentOnRequest(this.envValues, this.selectedRequest)
        }

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
        return this.microtextService.validation(this.validations, this.request);
    }

    validateTestRequest() {
        const testValidations = this.validations.filter(validation => {
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

    jsonTryParse(strObj: string) {
        try {
            return JSON.parse(strObj);
        }
        catch (e) {
            return null;
        }
    }

    setEnvironmentOnRequest(values: any, request: Request) {
        Object.keys(values).forEach(key => {
            const src = "{{" + key + "}}";
            const target = values[key];
            request.url = this.replaceEnvValue(request.url, src, target);
            request.cookies = this.replaceEnvValue(request.cookies, src, target);
            request.headers = this.replaceEnvValue(request.headers, src, target);
            let jsonBody: any;

            if (jsonBody = this.jsonTryParse(request.body)) {
                request.body = JSON.stringify(this.replaceEnvValue(jsonBody, src, target));
            }
        });
    }

    replaceEnvValue(param: any, src: string, dst: string) {
        if (typeof param == "string") {
            return this.replaceAll(param, src, dst);
        }
        else if (typeof param == "object") {
            Object.keys(param).forEach(key => {
                param[key] = this.replaceEnvValue(param[key], src, dst);
            });
        }

        return param;
    }

    replaceAll(str: string, src: string, dst: string) {
        return str.replace(new RegExp(src, 'g'), dst);
    }
}