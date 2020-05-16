import { Component, OnInit, Input } from '@angular/core';
import { Request } from '../requestCard.component'
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { MatrixService } from 'src/app/services/matrix.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

declare let $: any;

@Component({
    selector: 'test-request',
    templateUrl: './testRequest.html',
    providers: [MatrixService],
    styleUrls: ['./testRequest.css']
})

export class TestRequestComponent implements OnInit {
    @Input() request: Request;

    isSendRequest: boolean;
    response: any;

    constructor(private matrixService: MatrixService,
        private snackbarService: SnackbarService,
        private eventService: EventService) { }

    ngOnInit() {
        this.isSendRequest = true;

        this.matrixService.testRequest(this.request).then(result => {
            this.isSendRequest = false;

            if (!result) {
                this.snackbarService.snackbar("Server error occurred");
            }
            else {
                this.response = result;
                this.response.data = this.formatJson(this.response.data);
            }
        });
    }

    formatJson(data: string) {
        try {
            if (!data) {
                return data;
            }

            let jsn = JSON.parse(data);

            return JSON.stringify(jsn, null, "\t");
        }
        catch (e) {
            return data;
        }
    }

    copyResponse() {
        const textArea = document.createElement('textarea');
        textArea.value = this.response.data || "-";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.snackbarService.snackbar("Copy successfully");
    }

    closeWindow() {
        this.eventService.emit(EVENT_TYPE.CLOSE_TEST_REQUEST);
    }
}