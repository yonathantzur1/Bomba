import { Component, OnInit, OnDestroy } from '@angular/core';
import { Request } from '../../requestCard/requestCard.component';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

declare let $: any;

@Component({
    selector: 'matrix',
    templateUrl: './matrix.html',
    providers: [],
    styleUrls: ['./matrix.css']
})

export class MatrixComponent implements OnInit, OnDestroy {
    container: HTMLElement;
    cellSize: number = 150;
    minScrollCells: number;
    matrix: Array<Array<Request>> = [[null]];

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService) {
        eventService.register(EVENT_TYPE.ADD_REQUEST_CARD_TO_MATRIX, (data: any) => {
            let cellIndex = data.cellIndex;
            this.matrix[cellIndex[0]][cellIndex[1]] = Object.assign({}, data.request);
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.UNMARKED_MATRIX_CELLS, () => {
            this.unmarkedAllCells();
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
        this.matrix[i].push(null);
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
        this.matrix.push([null]);

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

    markCell(i: number, j: number, value?: boolean) {
        let request = this.matrix[i][j];

        request && (request.isMarked = (value != null) ? value : !request.isMarked);
    }

    unmarkedAllCells() {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                this.markCell(i, j, false);
            }
        }
    }
}