import { Component, Input } from '@angular/core';
import { Request } from '../../../requestCard/requestCard.component';

@Component({
    selector: 'cell',
    templateUrl: './cell.html',
    providers: [],
    styleUrls: ['./cell.css']
})

export class CellComponent {
    @Input()
    request: Request;

    @Input()
    index: any;

    constructor() { }
}