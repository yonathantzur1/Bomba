import { Component, Input } from '@angular/core';

export class Cell {
    name: string = "";
    amount: number = 1;
    requset: string = "";
}

@Component({
    selector: 'cell',
    templateUrl: './cell.html',
    providers: [],
    styleUrls: ['./cell.css']
})

export class CellComponent {
    @Input()
    data: Cell;

    constructor() { }
}