import { Component } from '@angular/core';
import { Cell } from './cell/cell.component';

@Component({
    selector: 'matrix',
    templateUrl: './matrix.html',
    providers: [],
    styleUrls: ['./matrix.css']
})

export class MatrixComponent {

    matrix: Array<Array<Cell>> = [[new Cell()]]

    constructor() { }

    addCol(i) {
        this.matrix[i].push(new Cell());
    }

    addRow() {
        this.matrix.push([new Cell()]);
    }
}