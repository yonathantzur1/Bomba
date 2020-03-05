import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatrixService } from '../../../services/matrix.service';
import { Request } from '../../requestCard/requestCard.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

declare let $: any;

@Component({
    selector: 'matrix',
    templateUrl: './matrix.html',
    providers: [MatrixService],
    styleUrls: ['./matrix.css']
})

export class MatrixComponent implements OnInit, OnDestroy {
    container: HTMLElement;
    cellSize: number = 150;
    minScrollCells: number;
    matrix: Array<Array<Request>> = [[new Request(true)]];
    isShowRequestCard: boolean = false;
    selectedRequest: Request;

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService,
        private alertService: AlertService,
        private matrixService: MatrixService) {
        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD_TO_MATRIX, (data: any) => {
            let rowIndex = data.cellIndex[0];
            let colIndex = data.cellIndex[1];
            let matrixRequest: Request = Object.assign({}, data.request);
            matrixRequest.id = data.request.generateGuid();
            this.matrix[rowIndex][colIndex] = matrixRequest;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowRequestCard = false;
            this.selectedRequest = null;
        }, this.eventsIds);
    }

    ngOnInit() {
        this.container = document.getElementById("matrix-container");
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    addCol(i: number) {
        this.removePlusHoverBackground();
        this.matrix[i].push(new Request(true));
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

    sendRequests() {
        this.alertService.alert({
            title: "Send Requests",
            text: "Start Bomba requests?",
            type: ALERT_TYPE.INFO,
            confirmFunc: () => {
                this.matrixService.sendRequests(this.matrix);
            }
        });
    }
}