import { Component, Input, OnInit, HostListener } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

@Component({
    selector: 'card',
    templateUrl: './card.html',
    styleUrls: ['./card.css']
})

export class CardComponent implements OnInit {

    @Input() title: string;
    @Input() width: number;
    @Input() height: number;
    @Input() disableEscape: boolean;
    @Input() onClose: Function;

    top: string;
    left: string;

    constructor(private eventService: EventService) { }

    ngOnInit() {
        this.top = "calc(50% - " + this.height / 2 + "px)";
        this.left = "calc(50% - " + this.width / 2 + "px)";
    }

    closeWindow() {
        this.onClose ? this.onClose() : this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (!this.disableEscape && event.code == "Escape") {
            this.closeWindow();
        }
    }
}