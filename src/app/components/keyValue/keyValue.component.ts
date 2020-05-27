import { Component, Input } from '@angular/core';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

declare let $: any;

@Component({
    selector: 'key-value',
    templateUrl: './keyValue.html',
    providers: [],
    styleUrls: ['./keyValue.css']
})

export class KeyValueComponent {

    @Input() json: any;

    key: string = "";
    value: string = "";

    constructor(private alertService: AlertService,
        private snackbarService: SnackbarService) { }

    getJsonKeys(json: any) {
        return Object.keys(json);
    }

    isAllowToAdd() {
        return !!this.key;
    }

    isKeyValid() {
        if ([" ", ","].find(char => {
            return this.key.includes(char);
        })) {
            this.snackbarService.snackbar("Config name is invalid");
            return false;
        }

        return true;
    }

    add() {
        if (this.isAllowToAdd() && this.isKeyValid()) {
            this.json[this.key] = this.value;
            this.key = "";
            this.value = "";
            $("#new-key").focus();
        }
    }

    delete(key: string) {
        this.alertService.alert({
            title: "Delete (" + key + ")",
            text: "Are you sure you want to remove this config variable?",
            type: ALERT_TYPE.DANGER,
            confirmFunc: () => {
                delete this.json[key];
            }
        });
    }

}