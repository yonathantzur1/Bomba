import { Component, Input } from '@angular/core';
import { Request } from 'src/app/components/requestCard/requestCard.component';
import { RequestResult } from 'src/app/components/board/matrix/matrix.component';

@Component({
    selector: 'report-matrix',
    templateUrl: './reportMatrix.html',
    styleUrls: ['./reportMatrix.css']
})

export class ReportMatrixComponent {

    @Input() matrix: Request[][];
    @Input() results: { requestId: RequestResult };

    constructor() { }

}