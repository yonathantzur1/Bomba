import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatrixService } from '../../../services/matrix.service';
import { BoardService } from 'src/app/services/board.service';
import { Request } from '../../requestCard/requestCard.component';
import { Environment } from '../../environments/environments.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { ReportsService } from 'src/app/services/reports.service';
import { EnvironmentsService } from 'src/app/services/environments.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { DefaultSettings } from '../../requestSettings/requestSettings.component';

declare const $: any;

export class RequestResult {
    success: number;
    fail: number;
    timeout: number;
    time: number;
    isStart: boolean;

    constructor() {
        this.success = 0;
        this.fail = 0;
        this.timeout = 0;
        this.time = 0;
        this.isStart = false;
    }
}

@Component({
    selector: 'matrix',
    templateUrl: './matrix.html',
    providers: [MatrixService, BoardService, ReportsService, EnvironmentsService],
    styleUrls: ['./matrix.css']
})

export class MatrixComponent implements OnInit, OnDestroy {

    @Input() projectId: string;
    @Input() projectName: string;
    @Input() matrix: Request[][];
    @Input() isSendMode: boolean;
    @Input() report: any;
    @Input() environments: Array<Environment>;
    @Input() maxRequestAmount: number;
    @Input() defaultSettings: DefaultSettings;

    requestsAmount: number;
    resultsAmount: number;

    container: HTMLElement;
    cellSize: number = 150;
    isShowRequestCard: boolean = false;
    isShowEnvironments: boolean = false;
    selectedRequest: Request;
    isRequestDisabled: boolean = false;

    selectedEnv: Environment;

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService,
        private globalService: GlobalService,
        public socketService: SocketService,
        public snackbarService: SnackbarService,
        public alertService: AlertService,
        private matrixService: MatrixService,
        private reportService: ReportsService,
        private environmentsService: EnvironmentsService,
        private boardService: BoardService) {

        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD_TO_MATRIX, (data: any) => {
            let rowIndex = data.cellIndex[0];
            let colIndex = data.cellIndex[1];
            let matrixRequest: Request = new Request().copy(data.request);
            matrixRequest.generateGuid();
            this.matrix[rowIndex][colIndex] = matrixRequest;
            this.saveMatrix();
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.SAVE_REQUEST_CARD, () => {
            this.saveMatrix();
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CHANGE_REQUEST_CARD_AMOUNT, () => {
            this.saveMatrix();
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.OPEN_REQUEST_EDIT, (request: Request) => {
            this.isShowRequestCard = true;
            this.selectedRequest = request;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.OPEN_REQUEST_VIEW, (request: Request) => {
            if (this.requestsAmount == this.resultsAmount) {
                this.isShowRequestCard = true;
                this.selectedRequest = request;
                this.isRequestDisabled = true;
            }
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowEnvironments = false;
            this.isShowRequestCard = false;
            this.selectedRequest = null;
            this.isRequestDisabled = false;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.DELETE_CELL, (index: any) => {
            this.deleteCell(index.i, index.j);
            this.saveMatrix();
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.DELETE_ENVIRONMENT, (envId: string) => {
            if (this.selectedEnv && this.selectedEnv.id == envId) {
                this.selectedEnv = null;
            }
        }, this.eventsIds);
    }

    ngOnInit() {
        this.container = document.getElementById("matrix-container");

        this.socketService.socketOn("requestStart", (data: any) => {
            if (data.projectId == this.projectId && this.report.results[data.requestId]) {
                this.report.results[data.requestId].isStart = true;
            }
        });

        this.socketService.socketOn("requestStatus", (data: any) => {
            this.updateRequestStatus(data);
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

        this.socketService.socketOn("syncSelectedEnv", (data: any) => {
            if (this.isSyncAllow(data.projectId, data.userGuid)) {
                this.selectedEnv = data.envId ? this.environments.find(env => env.id == data.envId) : null;
                this.setEnv(this.selectedEnv);
            }
        });

        this.requestsAmount = this.getMatrixRequestsAmount();
        this.resultsAmount = this.report ? this.getResultsAmount() : 0;

        this.selectedEnv = this.environments.find(env => {
            return env.isActive;
        }) || null;
        this.eventService.emit(EVENT_TYPE.SELECT_ENVIRONMENT, this.selectedEnv);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
        this.socketService.socketOff(["requestStart", "requestStatus", "syncSendRequests",
            "syncCloseReport", "syncSelectedEnv"]);
    }

    isSyncAllow(projectId: string, userGuid: string) {
        return (this.projectId == projectId && this.globalService.userGuid != userGuid);
    }

    setEnv(env: Environment) {
        this.eventService.emit(EVENT_TYPE.ACTIVE_ENVIRONMENT, env ? env.id : null);
        this.eventService.emit(EVENT_TYPE.SELECT_ENVIRONMENT, env);
    }

    selectEnv() {
        this.setEnv(this.selectedEnv);
        this.environmentsService.setActiveEnv(this.projectId, this.selectedEnv ? this.selectedEnv.id : null)
            .then(result => {
                if (!result) {
                    this.snackbarService.error();
                }
            });
        this.socketService.socketEmit('selfSync',
            'syncSelectedEnv',
            {
                "userGuid": this.globalService.userGuid,
                "projectId": this.projectId,
                "envId": this.selectedEnv ? this.selectedEnv.id : null
            });
    }

    updateRequestStatus(data: any) {
        if (data.projectId != this.projectId) {
            return;
        }

        let result: RequestResult = this.report.results[data.requestId];

        if (result) {
            result.success = data.success;
            result.fail = data.fail;
            result.timeout = data.timeout;
            result.time = data.time;
            this.resultsAmount += result.success + result.fail + result.timeout;
        }
    }

    addCol(i: number) {
        this.removePlusHoverBackground();
        this.matrix[i].push(new Request(true));
        this.saveMatrix();
        let currentColumnsAmount = this.matrix[i].length;
        let minScrollCells = Math.floor(this.container.clientWidth / this.cellSize) - 1;

        setTimeout(() => {
            if (!minScrollCells) {
                this.container.scrollLeft = this.container.scrollWidth - this.container.clientWidth;
            }
            else if (currentColumnsAmount >= minScrollCells) {
                this.container.scrollLeft =
                    (currentColumnsAmount - minScrollCells) * this.cellSize;
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

    isMatrixEmpty() {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                if (this.matrix[i][j].isEmpty == false) {
                    return false;
                }
            }
        }

        return true;
    }

    sendRequestsPreActions() {
        this.compressMatrix();
        this.requestsAmount = this.getMatrixRequestsAmount();
        this.initResultMatrix();
        this.matrixScrollTop();
        this.eventService.emit(EVENT_TYPE.REQUESTS_SEND_MODE, true);
    }

    sendRequests() {
        this.alertService.alert({
            title: "Send Requests",
            text: "Start bombing?",
            type: ALERT_TYPE.INFO,
            confirmFunc: () => {
                this.sendRequestsPreActions();
                this.matrixService.sendRequests(this.matrix, this.projectId,
                    this.defaultSettings.timeout, this.selectedEnv).then(result => {
                        if (!result) {
                            this.snackbarService.error();
                        }
                    });
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
            const result: RequestResult = this.report.results[reqId];

            amount += result.success + result.fail + result.timeout;
        });

        return amount;
    }

    closeReportPreActions() {
        this.isSendMode = false;
        this.report.results = {};
        this.resultsAmount = 0;
        this.matrixScrollTop();
        this.eventService.emit(EVENT_TYPE.REQUESTS_SEND_MODE, false);
    }

    closeReport() {
        this.closeReportPreActions();
        this.reportService.removeProjectReport(this.projectId);

        this.socketService.socketEmit('selfSync',
            'syncCloseReport',
            {
                "userGuid": this.globalService.userGuid,
                "projectId": this.projectId
            });

        this.eventService.emit(EVENT_TYPE.SELECT_ENVIRONMENT, this.selectedEnv);
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

    matrixScrollTop() {
        $("#matrix-container").scrollTop(0);
    }
}