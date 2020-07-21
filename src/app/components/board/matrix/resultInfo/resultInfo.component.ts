import { Component, Input } from '@angular/core';
import { Request } from '../../../requestCard/requestCard.component';
import { RequestResult } from '../matrix.component';

@Component({
    selector: 'result-info',
    templateUrl: './resultInfo.html',
    styleUrls: ['./resultInfo.css']
})

export class ResultInfoComponent {

    @Input() request: Request;
    @Input() result: RequestResult;

    constructor() { }

}