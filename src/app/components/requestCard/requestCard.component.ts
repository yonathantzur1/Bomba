import { Component, OnInit, HostListener, Input } from '@angular/core';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

export class Request {
    id: string;
    name: string = "";
    method: string;
    url: string = "";
    body: string = "";
    isMarked: boolean = false;

    // Create random guid for request.
    constructor() {
        let timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        this.id = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }
}

class BodyType {
    name: string;
    isChecked: boolean;
    template: string;

    constructor(name: string, isChecked: boolean, template?: string) {
        this.name = name;
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
    bodyTypes: Array<BodyType> = [];

    formatStr: string = "{  }";

    @Input()
    selectedRequest: Request;

    constructor(private microtextService: MicrotextService,
        private eventService: EventService) {
        this.bodyTypes.push(new BodyType("json", false));
        this.bodyTypes.push(new BodyType("text", false));

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
        this.request = Object.assign({}, this.selectedRequest) || new Request();
        this.selectBodyType(0);
    }

    closeWindow() {
        this.eventService.emit(EVENT_TYPE.CLOSE_REQUEST_CARD);
    }

    getSelectedBodyType(): BodyType {
        return this.bodyTypes.find((type: BodyType) => {
            return type.isChecked;
        });
    }

    selectBodyType(position: number) {
        let selectedType = this.getSelectedBodyType();

        if (selectedType) {
            selectedType.template = this.request.body;
            selectedType.isChecked = false;
        }

        this.bodyTypes[position].isChecked = true;

        this.request.body = this.bodyTypes[position].template;
    }

    formatJson(isFormat: boolean) {
        if (this.getSelectedBodyType().name == "json") {
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
    }

    bodyKeyDown(event: any) {
        if (event.code == "tab") {
            this.tabEnable();
        }

        let key = event.key;
        let keyCode = event.keyCode;

        if (key.length == 1 || keyCode == 8 || keyCode == 46) {
            this.formatJson(false);
        }
    }

    tabEnable() {
        let element: any = document.getElementById("req-body");

        // get caret position/selection
        let val = element.value;
        let start = element.selectionStart;
        let end = element.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        element.value = val.substring(0, start) + '\t' + val.substring(end);

        // put caret at right position again
        element.selectionStart = element.selectionEnd = start + 1;

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

            this.closeWindow();
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

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.closeWindow();
        }
    }
}