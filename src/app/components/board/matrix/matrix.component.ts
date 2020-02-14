import { Component, OnInit } from '@angular/core';
import { Cell } from './cell/cell.component';

@Component({
    selector: 'matrix',
    templateUrl: './matrix.html',
    providers: [],
    styleUrls: ['./matrix.css']
})

export class MatrixComponent implements OnInit {
    container: HTMLElement;
    cellSize: number = 100;
    minScrollCells: number;

    ngOnInit(): void {
        this.container = document.getElementById("matrix-container");
    }

    matrix: Array<Array<Cell>> = [[new Cell()]]

    constructor() { }

    addCol(i) {
        this.matrix[i].push(new Cell());
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
        this.matrix.push([new Cell()]);

        setTimeout(() => {
            this.container.scrollTop = this.container.scrollHeight - this.container.clientHeight;
        }, 0);
    }
}