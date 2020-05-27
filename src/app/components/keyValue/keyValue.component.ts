import { Component, Input } from '@angular/core';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

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

    constructor(private alertService: AlertService) { }

    getJsonKeys(json: any) {
        return Object.keys(json);
    }

    isAllowToAdd() {
        return !!this.key;
    }

    add() {
        if (this.isAllowToAdd()) {
            this.json[this.key] = this.value;
            this.key = "";
            this.value = "";
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