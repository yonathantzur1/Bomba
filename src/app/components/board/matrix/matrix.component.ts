import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatrixService } from '../../../services/matrix.service';
import { BoardService } from 'src/app/services/board.service';
import { Request } from '../../requestCard/requestCard.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { ReportsService } from 'src/app/services/reports.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

declare let $: any;

export class RequestResult {
    success: number;
    fail: number;
    time: number;
    isStart: boolean;

    constructor() {
        this.success = 0;
        this.fail = 0;
        this.time = 0;
        this.isStart = false;
    }
}

@Component({
    selector: 'matrix',
    templateUrl: './matrix.html',
    providers: [MatrixService, BoardService, ReportsService],
    styleUrls: ['./matrix.css']
})

export class MatrixComponent implements OnInit, OnDestroy {

    @Input() projectId: string;
    @Input() projectName: string;
    @Input() matrix: Request[][];
    @Input() isSendMode: boolean;
    @Input() report: any;

    requestsAmount: number;
    resultsAmount: number;

    container: HTMLElement;
    cellSize: number = 150;
    minScrollCells: number;
    isShowRequestCard: boolean = false;
    selectedRequest: Request;

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService,
        private globalService: GlobalService,
        public socketService: SocketService,
        public snackbarService: SnackbarService,
        public alertService: AlertService,
        private matrixService: MatrixService,
        private reportService: ReportsService,
        private boardService: BoardService) {

        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD_TO_MATRIX, (data: any) => {
            let rowIndex = data.cellIndex[0];
            let colIndex = data.cellIndex[1];
            let matrixRequest: Request = Object.assign({}, data.request);
            matrixRequest.id = data.request.generateGuid();
            this.matrix[rowIndex][colIndex] = matrixRequest;
            this.saveMatrix();
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowRequestCard = false;
            this.selectedRequest = null;
            this.saveMatrix();
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CHANGE_REQUEST_CARD_AMOUNT, () => {
            this.saveMatrix();
        }, this.eventsIds);
    }

    ngOnInit() {
        this.container = document.getElementById("matrix-container");

        this.socketService.socketOn("requestStart", (data: any) => {
            if (data.projectId == this.projectId) {
                this.report.results[data.requestId].isStart = true;
            }
        });

        this.socketService.socketOn("requestSuccess", (data: any) => {
            this.increaseRequestStatus(data, "success");
        });

        this.socketService.socketOn("requestError", (data: any) => {
            this.increaseRequestStatus(data, "fail");
        });

        this.socketService.socketOn("syncSendRequests", (data: any) => {
            if (this.isSyncAllow(data.projectId, data.userGuid)) {
                this.sendRequestsPreActions();
            }
        });

        this.socketService.socketOn("syncCloseReport", (data: any) => {
            if (this.isSyncAllow(data.projectId, data.userGuid)) {
                this.closeReportPreActions();
            }
        });

        this.requestsAmount = this.getMatrixRequestsAmount();
        this.resultsAmount = this.report ? this.getResultsAmount() : 0;
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
        this.socketService.socketOff("requestStart");
        this.socketService.socketOff("requestSuccess");
        this.socketService.socketOff("requestError");
        this.socketService.socketOff("syncSendRequests");
        this.socketService.socketOff("syncCloseReport");
    }

    isSyncAllow(projectId: string, userGuid: string) {
        return (this.projectId == projectId && this.globalService.userGuid != userGuid);
    }

    increaseRequestStatus(data: any, status: string) {
        if (data.projectId != this.projectId) {
            return;
        }

        let result: RequestResult = this.report.results[data.requestId];

        if (result) {
            result[status]++;
            this.resultsAmount++;
            result.time += data.time;
        }
    }

    addCol(i: number) {
        this.removePlusHoverBackground();
        this.matrix[i].push(new Request(true));
        this.saveMatrix();
        let currentColumnsAmount = this.matrix[i].length;

        setTimeout(() => {
            if (!this.minScrollCells) {
                this.container.scrollLeft = this.container.scrollWidth - this.container.clientWidth;
            }
            else if (currentColumnsAmount >= this.minScrollCells) {
                this.container.scrollLeft =
                    (currentColumnsAmount - this.minScrollCells) * this.cellSize
            }

            if (!this.minScrollCells &&
                (this.container.scrollWidth > this.container.clientWidth)) {
                this.minScrollCells = currentColumnsAmount - 1;
            }
        }, 0);
    }

    addRow() {
        this.removePlusHoverBackground();
        this.matrix.push([new Request(true)]);
        this.saveMatrix();

        setTimeout(() => {
            this.container.scrollTop = this.container.scrollHeight - this.container.clientHeight;
        }, 0);
    }

    removePlusHoverBackground() {
        let plusSectorElement = $(".plus-sector");
        plusSectorElement.css("background-color", "initial");

        setTimeout(() => {
            plusSectorElement.css("background-color", "");
        }, 0);
    }

    openRequestEdit(requset: Request) {
        this.selectedRequest = requset;
        this.isShowRequestCard = true;
    }

    deleteCell(i: number, j: number) {
        if (!this.matrix[i][j].isEmpty) {
            this.matrix[i][j] = new Request(true);
            return;
        }
        else if (this.isLastCellOnMatrix()) {
            return;
        }

        let row = this.matrix[i];
        row.splice(j, 1);

        if (row.length == 0) {
            this.matrix.splice(i, 1);
        }
    }

    isLastCellOnMatrix(): boolean {
        return (this.matrix.length == 1 && this.matrix[0].length == 1);
    }

    compressMatrix() {
        // Scan matrix on reverse order and delete empty cells.
        for (let i = this.matrix.length - 1; i >= 0; i--) {
            for (let j = this.matrix[i].length - 1; j >= 0; j--) {
                if (this.matrix[i][j].isEmpty) {
                    this.deleteCell(i, j);
                }
            }
        }

        this.saveMatrix();
    }

    isMatrixNotEmpty() {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                if (this.matrix[i][j].isEmpty == false) {
                    return true;
                }
            }
        }

        return false;
    }

    sendRequestsPreActions() {
        this.compressMatrix();
        this.requestsAmount = this.getMatrixRequestsAmount();
        this.initResultMatrix();
        this.eventService.emit(EVENT_TYPE.REQUESTS_SEND_MODE, true);
    }

    sendRequests() {
        this.alertService.alert({
            title: "Send Requests",
            text: "Start bombing?",
            type: ALERT_TYPE.INFO,
            confirmFunc: () => {
                this.sendRequestsPreActions();
                this.matrixService.sendRequests(this.matrix, this.projectId);
                this.socketService.socketEmit('selfSync', 'syncSendRequests',
                    {
                        "userGuid": this.globalService.userGuid,
                        "projectId": this.projectId
                    });
            }
        });
    }

    initResultMatrix() {
        this.report = { "results": {} };

        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                let request: Request = this.matrix[i][j];

                if (!request.isEmpty) {
                    this.report.results[request.id] = new RequestResult();
                }
            }
        }
    }

    saveMatrix() {
        this.boardService.saveMatrix(this.projectId, this.matrix);
        this.socketService.socketEmit('selfSync',
            'syncMatrix',
            {
                "userGuid": this.globalService.userGuid,
                "projectId": this.projectId,
                "matrix": this.matrix
            });
    }

    getMatrixRequestsAmount() {
        let amount = 0;

        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                amount += this.matrix[i][j].amount;
            }
        }

        return amount;
    }

    getResultsAmount() {
        let amount = 0;

        Object.keys(this.report.results).forEach(reqId => {
            let result = this.report.results[reqId];

            amount += result.success + result.fail;
        });

        return amount;
    }

    closeReportPreActions() {
        this.eventService.emit(EVENT_TYPE.REQUESTS_SEND_MODE, false);
        this.report.results = {};
        this.resultsAmount = 0;
    }

    closeReport() {
        this.closeReportPreActions();
        this.reportService.removeReport(this.projectId);

        this.socketService.socketEmit('selfSync',
            'syncCloseReport',
            {
                "userGuid": this.globalService.userGuid,
                "projectId": this.projectId
            });
    }

    stopRequests() {
        this.alertService.alert({
            title: "Stop Requests",
            text: "Please confirm stopping requests sending.",
            type: ALERT_TYPE.INFO,
            confirmFunc: () => {
                this.matrixService.stopRequests(this.projectId);
                this.closeReport();
            }
        });
    }

    getResultAverageTime(result: RequestResult) {
        if (result == null) {
            return null;
        }

        let resultsAmount = result.success + result.fail;
        return resultsAmount == 0 ? null : (result.time / resultsAmount).toFixed(3);
    }
}