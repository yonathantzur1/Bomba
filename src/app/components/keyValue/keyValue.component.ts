import { Component, OnDestroy, Input } from '@angular/core';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

declare let $: any;

@Component({
    selector: 'key-value',
    templateUrl: './keyValue.html',
    styleUrls: ['./keyValue.css']
})

export class KeyValueComponent implements OnDestroy {

    @Input() json: any;

    key: string = "";
    value: string = "";

    isEditMode: boolean = false;
    editKey: string;
    editValue: string;

    eventsIds: Array<string> = [];

    constructor(private alertService: AlertService,
        private eventService: EventService,
        private snackbarService: SnackbarService) {
        this.eventService.register(EVENT_TYPE.CLOSE_EDIT_VALUE, () => {
            this.editKey = null;
            this.editValue = null;
            this.isEditMode = false;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    getJsonKeys(json: any) {
        return Object.keys(json);
    }

    isAllowToAdd() {
        return !!this.key;
    }

    isKeyValid() {
        let template = new RegExp('^[A-Za-z_][A-Za-z0-9_-]*$');

        if (template.test(this.key)) {
            return true;
        }
        else {
            this.snackbarService.snackbar("Config name is invalid");
            return false;
        }
    }

    add() {
        if (this.isAllowToAdd() && this.isKeyValid()) {
            this.json[this.key] = this.value;
            this.key = "";
            this.value = "";
            $("#new-key").focus();

            setTimeout(() => {
                $("#keyValue")[0].scrollTop = $("#keyValue")[0].scrollHeight;
            }, 0);
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

    openEdit(key: string, value: string) {
        this.editKey = key;
        this.editValue = value;
        this.isEditMode = true;
    }

    closeEdit() {
        this.eventService.emit(EVENT_TYPE.CLOSE_EDIT_VALUE);
    }

    saveEdit() {
        this.json[this.editKey] = this.editValue;
        this.closeEdit();
    }
}