import { Component } from '@angular/core';
import { Cell } from './cell/cell.component'
import { BoardService } from '../../services/board.service';

@Component({
    selector: 'board',
    templateUrl: './board.html',
    providers: [BoardService],
    styleUrls: ['./board.css']
})

export class BoardComponent {
    matrix: Array<Array<Cell>> = [[new Cell()]]

    constructor(private boardService: BoardService) { }
}