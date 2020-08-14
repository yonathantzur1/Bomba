import { Component, OnInit, Input } from '@angular/core';
import { Request } from '../requestCard.component'
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { MatrixService } from 'src/app/services/matrix.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
    selector: 'test-request',
    templateUrl: './testRequest.html',
    providers: [MatrixService],
    styleUrls: ['./testRequest.css']
})

export class TestRequestComponent implements OnInit {
    @Input() request: Request;
    @Input() requestTimeout: number;

    isSendRequest: boolean;
    response: any;

    constructor(private matrixService: MatrixService,
        private globalService: GlobalService,
        private snackbarService: SnackbarService,
        private eventService: EventService) { }

    ngOnInit() {
        this.isSendRequest = true;

        this.matrixService.testRequest(this.request, this.requestTimeout).then(result => {
            this.isSendRequest = false;

            if (!result) {
                this.snackbarService.snackbar("Server error occurred");
                this.closeWindow();
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
        this.globalService.copyToClipboard(this.response.data)
        this.snackbarService.snackbar("Copy successfully");
    }

    closeWindow() {
        this.eventService.emit(EVENT_TYPE.CLOSE_TEST_REQUEST);
    }
}