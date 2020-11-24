import { Component, HostListener, Input } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

export class ContextMenu {
    xPos: number = 0;
    yPos: number = 0;
    id: any;

    constructor(xPos: number, yPos: number, id: any) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.id = id;
    }
}

export class MenuItem {
    text: string;
    icon: string;
    action: Function;

    constructor(text: string, icon: string, action: Function) {
        this.text = text;
        this.icon = icon;
        this.action = action;
    }
}

@Component({
    selector: 'context-menu',
    templateUrl: './contextMenu.html',
    styleUrls: ['./contextMenu.css']
})

export class ContextMenuComponent {
    @Input() contextMenu: ContextMenu;
    @Input() items: Array<MenuItem>;

    constructor(private eventService: EventService) { }

    closeContextMenu(event: any) {
        event.preventDefault();
        this.eventService.emit(EVENT_TYPE.CLOSE_CONTEXT_MENU);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.key == "Escape") {
            this.closeContextMenu(event);
        }
    }
}