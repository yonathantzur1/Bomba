import { Component, Input } from '@angular/core';
import { Request } from '../../../card/card.component';

@Component({
    selector: 'cell',
    templateUrl: './cell.html',
    providers: [],
    styleUrls: ['./cell.css']
})

export class CellComponent {
    @Input()
    data: Request;

    constructor() { }
}