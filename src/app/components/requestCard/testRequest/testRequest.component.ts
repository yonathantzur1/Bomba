import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Request } from '../requestCard.component'
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { MatrixService } from 'src/app/services/matrix.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SocketService } from 'src/app/services/global/socket.service';

@Component({
    selector: 'test-request',
    templateUrl: './testRequest.html',
    providers: [MatrixService],
    styleUrls: ['./testRequest.css']
})

export class TestRequestComponent implements OnInit, OnDestroy {
    @Input() request: Request;
    @Input() requestTimeout: number;
    @Input() envValues: any;

    isSendRequest: boolean;
    response: any;

    constructor(private matrixService: MatrixService,
        private globalService: GlobalService,
        private socketService: SocketService,
        private snackbarService: SnackbarService,
        private eventService: EventService) { }

    ngOnInit() {
        this.isSendRequest = true;

        this.matrixService.testRequest(this.request, this.requestTimeout, this.envValues).then(result => {
            if (!result) {
                this.isSendRequest = false;
                this.snackbarService.error();
                this.closeWindow();
            }
        });

        this.socketService.socketOn("testResult", (result: any, requestId: string) => {
            if (this.request.id == requestId) {
                this.isSendRequest = false;
                this.response = result;
                this.response.data = this.formatJson(this.response.data);
            }
        });
    }

    ngOnDestroy() {
        this.socketService.socketOff(["testResult"]);
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