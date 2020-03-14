import { Component, HostListener } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { METHOD } from '../requestCard/requestCard.component';

export class DefaultSettings {
    url: string;
    method: METHOD;

    constructor() {
        this.url = "";
        this.method = METHOD.DEFAULT;
    }
}

@Component({
    selector: 'request-settings',
    templateUrl: './requestSettings.html',
    providers: [],
    styleUrls: ['./requestSettings.css']
})

export class RequestSettingsComponent {
    defaultSettings: DefaultSettings;
    method: any = METHOD;

    constructor(private eventService: EventService) {
        this.defaultSettings = new DefaultSettings();
    }

    setDefault() {
        if (this.defaultSettings.url || this.defaultSettings.method != METHOD.DEFAULT) {
            this.eventService.emit(EVENT_TYPE.SET_DEFAULT_REQUEST_SETTINGS, this.defaultSettings);
        }

        this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.code == "Enter") {
            this.setDefault();
        }
    }
}