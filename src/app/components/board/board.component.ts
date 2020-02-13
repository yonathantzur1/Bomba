import { Component } from '@angular/core';
import { BoardService } from '../../services/board.service';

@Component({
    selector: 'board',
    templateUrl: './board.html',
    providers: [BoardService],
    styleUrls: ['./board.css']
})

export class BoardComponent {
    constructor(private boardService: BoardService) { };
}