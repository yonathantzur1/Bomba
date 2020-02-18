import { Component, OnInit } from '@angular/core';
import { Request } from '../../requestCard/requestCard.component';

@Component({
    selector: 'matrix',
    templateUrl: './matrix.html',
    providers: [],
    styleUrls: ['./matrix.css']
})

export class MatrixComponent implements OnInit {
    container: HTMLElement;
    cellSize: number = 150;
    minScrollCells: number;

    ngOnInit(): void {
        this.container = document.getElementById("matrix-container");
    }

    matrix: Array<Array<Request>> = [[new Request()]]

    constructor() { }

    addCol(i) {
        this.matrix[i].push(new Request());
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
        this.matrix.push([new Request()]);

        setTimeout(() => {
            this.container.scrollTop = this.container.scrollHeight - this.container.clientHeight;
        }, 0);
    }
}