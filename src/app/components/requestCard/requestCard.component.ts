import { Component, OnInit, Input } from '@angular/core';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { DefaultSettings } from '../requestSettings/requestSettings.component';

export enum METHOD {
    DEFAULT = "Default Method",
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

export class Request {
    id: string;
    name: string;
    method: METHOD;
    url: string;
    body: Body;
    amount: number;
    isEmpty: boolean;

    // Create random guid for request.
    constructor(isEmpty?: boolean) {
        this.isEmpty = !!isEmpty;

        if (!this.isEmpty) {
            this.id = this.generateGuid();
            this.name = "";
            this.method = METHOD.GET;
            this.url = "";
            this.body = new Body(BODY_TYPE.JSON, true);
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

    public generateGuid(): string {
        let timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }
}

enum BODY_TYPE {
    JSON = "json",
    TEXT = "text"
}

class Body {
    type: BODY_TYPE;
    isChecked: boolean;
    template: string;

    constructor(type: BODY_TYPE, isChecked: boolean, template?: string) {
        this.type = type;
        this.isChecked = isChecked;
        this.template = template || "";
    }
}

@Component({
    selector: 'request-card',
    templateUrl: './requestCard.html',
    providers: [],
    styleUrls: ['./requestCard.css']
})

export class RequestCardComponent implements OnInit {
    request: Request;
    validationFuncs: Array<InputFieldValidation>;
    isValidBodyJson: boolean = true;
    bodyOptions: Array<Body> = [];
    bodyType: any = BODY_TYPE;
    formatStr: string = "{  }";
    method: any = METHOD;

    @Input()
    selectedRequest: Request;

    @Input()
    defaultSettings: DefaultSettings;

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
            }
        ];
    }

    ngOnInit() {
        if (this.selectedRequest) {
            this.request = Object.assign({}, this.selectedRequest);
        }
        else {
            this.request = new Request();
            this.setDefaultSettings();
        }

        Object.keys(BODY_TYPE).forEach(type => {
            if (this.request.body.type == BODY_TYPE[type]) {
                this.bodyOptions.push(Object.assign({}, this.request.body));
            }
            else {
                this.bodyOptions.push(new Body(BODY_TYPE[type], false));
            }
        });

        this.formatJson(true);
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

    getSelectedBodyOption(): Body {
        return this.bodyOptions.find((type: Body) => {
            return type.isChecked;
        });
    }

    selectBodyOption(index: number) {
        let currentBodyOption = this.getSelectedBodyOption();

        if (currentBodyOption) {
            currentBodyOption.template = this.request.body.template;
            currentBodyOption.isChecked = false;
        }

        let selectedBodyOption = this.bodyOptions[index];
        selectedBodyOption.isChecked = true;
        this.request.body = selectedBodyOption;
    }

    formatJson(isFormat: boolean) {
        if (this.getSelectedBodyOption().type == BODY_TYPE.JSON) {
            setTimeout(() => {
                try {
                    if (this.request.body.template == "") {
                        this.isValidBodyJson = true;
                        return;
                    }

                    let jsn = JSON.parse(this.request.body.template);
                    isFormat && (this.request.body.template = JSON.stringify(jsn, null, "\t"));
                    this.isValidBodyJson = true;
                }
                catch (e) {
                    this.isValidBodyJson = false;
                }

            }, 0);
        }
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