import { Component, Input, OnInit } from '@angular/core';

import { EnvironmentsService } from '../../services/environments.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

declare let $: any;

export class Environment {
    name: string;
    values: any;
    isActice: boolean;

    constructor() {
        this.name = "";
        this.values = {};
        this.isActice = false;
    }
}

enum WINDOW_TYPE {
    EMPTY,
    ADD,
    LIST
}

@Component({
    selector: 'environments',
    templateUrl: './environments.html',
    providers: [EnvironmentsService],
    styleUrls: ['./environments.css']
})

export class EnvironmentsComponent implements OnInit {

    @Input() projectId: string;
    @Input() environments: Array<Environment>;

    isAddEnvironment: boolean = false;
    newEnvironment: Environment = new Environment();
    validationFuncs: Array<InputFieldValidation>;

    currWindowType: WINDOW_TYPE;
    windowType: any = WINDOW_TYPE;

    constructor(private environmentsService: EnvironmentsService,
        private alertService: AlertService,
        private snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        private eventService: EventService) {
        this.validationFuncs = [
            {
                isFieldValid(env: Environment) {
                    return !!env.name;
                },
                errMsg: "Please enter environment name",
                fieldId: "new-env-name-micro",
                inputId: "new-env-name"
            }
        ];
    }

    ngOnInit() {
        if (this.environments.length == 0) {
            this.currWindowType = WINDOW_TYPE.EMPTY;
        }
        else {
            this.currWindowType = WINDOW_TYPE.LIST;
        }
    }

    addEnv() {
        if (this.microtextService.validation(this.validationFuncs, this.newEnvironment)) {
            this.environmentsService.addEnv(this.projectId, this.newEnvironment).then(result => {
                // In case of server error.
                if (!result) {
                    this.snackbarService.snackbar("Server error occurred");
                }
                // In case the env name is exists.
                else if (result == "-1") {
                    $("#new-env-name-micro").html("The name is already in use");
                }
                else {
                    this.eventService.emit(EVENT_TYPE.ADD_ENVIRONMENT, this.newEnvironment);
                    this.currWindowType = WINDOW_TYPE.LIST;
                    this.newEnvironment = new Environment();
                }
            });
        }
    }

    deleteEnv(envName: string) {
        this.alertService.alert({
            title: "Delete Environment",
            text: "Are you sure you want to delete this environment?",
            type: ALERT_TYPE.DANGER,
            confirmFunc: () => {
                const isLastEnv: boolean = (this.environments.length == 1);

                this.environmentsService.deleteEnv(this.projectId, envName).then(result => {
                    if (!result) {
                        this.snackbarService.snackbar("Server error occurred");
                    }
                    else {
                        this.eventService.emit(EVENT_TYPE.DELETE_ENVIRONMENT, envName);

                        if (isLastEnv) {
                            this.currWindowType = WINDOW_TYPE.EMPTY;
                        }
                    }
                });
            }
        });
    }

    duplicateEnv(envValues: any) {
        this.newEnvironment.values = JSON.parse(JSON.stringify(envValues));
        this.currWindowType = WINDOW_TYPE.ADD;
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}