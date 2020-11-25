import { Component, HostListener } from '@angular/core';

import { AlertService, ALERT_TYPE } from '../../services/global/alert.service';

@Component({
    selector: 'alert',
    templateUrl: './alert.html',
    styleUrls: ['./alert.css']
})

export class AlertComponent {

    ALERT_TYPE = ALERT_TYPE;

    constructor(public alertService: AlertService) { }

    confirmClick() {
        !this.alertService.isLoading && this.alertService.confirm();
    }

    closeClick() {
        !this.alertService.isLoading && this.alertService.close();
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.key == "Enter") {
            this.confirmClick();
        }
        else if (event.key == "Escape" && !this.alertService.disableEscapeExit) {
            this.closeClick();
        }
    }
}