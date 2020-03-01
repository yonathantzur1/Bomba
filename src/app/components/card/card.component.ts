import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'card',
    templateUrl: './card.html',
    providers: [],
    styleUrls: ['./card.css']
})

export class CardComponent implements OnInit {
    @Input()
    width: number;

    @Input()
    height: number;

    top: string;
    left: string;

    ngOnInit() {
        this.top = "calc(50% - " + this.height / 2 + "px)";
        this.left = "calc(50% - " + this.width / 2 + "px)";
    }
}