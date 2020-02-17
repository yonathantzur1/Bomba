import { Component, HostListener } from '@angular/core';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

export class Request {
    id: string;
    name: string = "";
    method: string;
    url: string = "";
    body: string;

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
    selector: 'card',
    templateUrl: './card.html',
    providers: [],
    styleUrls: ['./card.css']
})

export class CardComponent {
    request: Request = new Request();
    validationFuncs: Array<InputFieldValidation>;
    isValidBodyJson: boolean;
    bodyTypes: Array<BodyType> = [];

    constructor(private microtextService: MicrotextService,
        private eventService: EventService) {
        this.bodyTypes.push(new BodyType("json", false));
        this.bodyTypes.push(new BodyType("text", false));
        this.selectBodyType(0);

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

    formatJson() {
        if (this.getSelectedBodyType().name == "json") {
            try {
                let jsn = JSON.parse(this.request.body);
                this.request.body = JSON.stringify(jsn, null, "\t");
                this.isValidBodyJson = true;
            }
            catch (e) {
                this.isValidBodyJson = true;
            }
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
            this.eventService.emit(EVENT_TYPE.ADD_REQUEST_CARD, this.request);
            this. closeWindow();
        }
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