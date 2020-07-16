import { Component, Input } from '@angular/core';
import { ApiManagerService } from 'src/app/services/apiManager.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { MicrotextService } from 'src/app/services/global/microtext.service';
import { EventService } from 'src/app/services/global/event.service';

@Component({
    selector: 'api-generator',
    templateUrl: './apiGenerator.html',
    providers: [ApiManagerService],
    styleUrls: ['./apiGenerator.css']
})

export class ApiGeneratorComponent {

    isShowApiKey: boolean = false;
    @Input() apiKey: string;
    @Input() projectsNames: Array<string>;

    constructor(private apiManagerService: ApiManagerService,
        private eventService: EventService,
        private snackbarService: SnackbarService,
        private microtextService: MicrotextService) {
    }

    hideMicrotext(id: string) {
        this.microtextService.hideMicrotext(id);
    }

    showHideApiKey() {
        this.isShowApiKey = !this.isShowApiKey;
    }
}