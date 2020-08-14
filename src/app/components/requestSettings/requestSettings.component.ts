import { Component, OnInit, HostListener, Input } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { METHOD } from 'src/app/enums';

export class DefaultSettings {
    url: string;
    method: METHOD;
    timeout: number;

    copy(settings: any) {
        this.url = settings?.url || "";
        this.method = settings?.method || METHOD.DEFAULT;
        this.timeout = settings?.timeout;

        return this;
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
    @Input() originalDefaultSettings: DefaultSettings;

    defaultSettings: DefaultSettings;
    currTimeout: number;

    minTimeout: number = 1;
    maxTimeout: number = 100000;

    method: any = METHOD;

    constructor(private eventService: EventService,
        private globalService: GlobalService,
        private socketService: SocketService,
        private projectService: ProjectsService) { }

    ngOnInit() {
        this.defaultSettings = new DefaultSettings().copy(this.originalDefaultSettings);
        this.currTimeout = this.defaultSettings.timeout;
    }

    setDefault() {
        this.eventService.emit(EVENT_TYPE.SET_DEFAULT_REQUEST_SETTINGS, this.defaultSettings);
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

    timeoutChanged() {
        if (!this.defaultSettings.timeout) {
            this.defaultSettings.timeout = this.currTimeout;
        }
        else if (this.defaultSettings.timeout < this.minTimeout) {
            this.defaultSettings.timeout = this.minTimeout;
        }
        else if (this.defaultSettings.timeout > this.maxTimeout) {
            this.defaultSettings.timeout = this.maxTimeout;
        }
        else {
            this.currTimeout = this.defaultSettings.timeout;
        }
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.key == "Enter") {
            this.setDefault();
        }
    }
}