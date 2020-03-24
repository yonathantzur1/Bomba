import { Component, OnInit, HostListener, Input } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { METHOD } from 'src/app/enums';

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
    providers: [ProjectsService],
    styleUrls: ['./requestSettings.css']
})

export class RequestSettingsComponent implements OnInit {

    @Input() projectId: string;
    @Input() defaultSettings: DefaultSettings;

    method: any = METHOD;

    constructor(private eventService: EventService,
        private globalService: GlobalService,
        private socketService: SocketService,
        private projectService: ProjectsService) { }

    ngOnInit() {
        if (!this.defaultSettings) {
            this.defaultSettings = new DefaultSettings();
        }
    }

    setDefault() {
        if (this.defaultSettings.url || this.defaultSettings.method != METHOD.DEFAULT) {
            this.eventService.emit(EVENT_TYPE.SET_DEFAULT_REQUEST_SETTINGS, this.defaultSettings);
        }

        this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
        this.projectService.saveRequestSettings(this.projectId, this.defaultSettings);
        this.socketService.socketEmit('selfSync',
            'syncDefaultSettings',
            {
                "userGuid": this.globalService.userGuid,
                "projectId": this.projectId,
                "defaultSettings": this.defaultSettings
            });
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.code == "Enter") {
            this.setDefault();
        }
    }
}