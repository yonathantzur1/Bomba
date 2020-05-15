import { Component, OnInit, Input } from '@angular/core';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { DefaultSettings } from '../requestSettings/requestSettings.component';
import { METHOD } from 'src/app/enums';
import { generateGuid } from 'src/app/globals';

export class Request {
    id: string;
    name: string;
    method: METHOD;
    url: string;
    body: string;
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
    providers: [],
    styleUrls: ['./requestCard.css']
})

export class RequestCardComponent implements OnInit {

    @Input() selectedRequest: Request;
    @Input() defaultSettings: DefaultSettings;

    request: Request;
    validationFuncs: Array<InputFieldValidation>;
    isValidBodyJson: boolean = true;
    formatStr: string = "{  }";
    method: any = METHOD;

    isShowInfo: boolean = false;

    constructor(private microtextService: MicrotextService,
        private eventService: EventService) {
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
    }

    ngOnInit() {
        if (this.selectedRequest) {
            this.request = JSON.parse(JSON.stringify(this.selectedRequest));
        }
        else {
            this.request = new Request();
            this.setDefaultSettings();
        }

        this.formatJson(true);
    }

    showInfo(isShow: boolean) {
        this.isShowInfo = isShow;
    }

    setDefaultSettings() {
        if (this.defaultSettings) {
            if (this.defaultSettings.url) {
                this.request.url = this.defaultSettings.url;
            }

            if (this.defaultSettings.method != METHOD.DEFAULT) {
                this.request.method = this.defaultSettings.method;
            }
        }
    }

    formatJson(isFormat: boolean) {
        setTimeout(() => {
            try {
                if (this.request.body == "") {
                    this.isValidBodyJson = true;
                    return;
                }

                let jsn = JSON.parse(this.request.body);
                isFormat && (this.request.body = JSON.stringify(jsn, null, "\t"));
                this.isValidBodyJson = true;
            }
            catch (e) {
                this.isValidBodyJson = false;
            }

        }, 0);
    }

    bodyKeyDown(event: any) {
        if (event.code == "Tab") {
            this.tabEnable(event);
        }

        let key = event.key;
        let keyCode = event.keyCode;

        if (key.length == 1 || keyCode == 8 || keyCode == 46) {
            this.formatJson(false);
        }
    }

    tabEnable(event: any) {
        let element: any = document.getElementById("req-body");

        // get caret position/selection
        let val = element.value;
        let start = element.selectionStart;
        let end = element.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        element.value = val.substring(0, start) + '\t' + val.substring(end);

        // put caret at right position again
        element.selectionStart = element.selectionEnd = start + 1;

        event.preventDefault();

        // prevent the focus lose
        return false;
    }

    validateRequest() {
        return this.microtextService.validation(this.validationFuncs, this.request);
    }

    addReqest() {
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

    hideMicrotext(id: string) {
        this.microtextService.hideMicrotext(id);
    }
}