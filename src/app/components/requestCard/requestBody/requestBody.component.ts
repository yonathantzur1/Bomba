import { Component, Input, OnInit } from '@angular/core';
import { Request } from '../requestCard.component';

@Component({
    selector: 'request-body',
    templateUrl: './requestBody.html',
    styleUrls: ['./requestBody.css']
})

export class RequestBodyComponent implements OnInit {

    @Input() request: Request;
    @Input() isDisabled: boolean;

    isShowInfo: boolean = false;
    isValidBodyJson: boolean = true;
    formatStr: string = "{  }";

    constructor() { }

    ngOnInit() {
        this.formatJson(true);
    }

    showInfo(isShow: boolean) {
        this.isShowInfo = isShow;
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
}