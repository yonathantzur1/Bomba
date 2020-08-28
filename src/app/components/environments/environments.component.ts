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

    copy(env: Environment) {
        this.name = env.name;
        this.values = JSON.parse(JSON.stringify(env.values));

        return this;
    }
}

enum WINDOW_TYPE {
    EMPTY,
    ADD,
    UPDATE,
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
    environment: Environment = new Environment();
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
        this.setWindowType();
    }

    setWindowType() {
        if (this.environments.length == 0) {
            this.currWindowType = WINDOW_TYPE.EMPTY;
        }
        else {
            this.currWindowType = WINDOW_TYPE.LIST;
        }
    }

    back() {
        this.setWindowType();
        this.environment = new Environment();
    }

    openAddWindow() {
        this.currWindowType = WINDOW_TYPE.ADD;
        setTimeout(() => {
            $("#new-env-name").focus();
        }, 0);
    }

    addEnv() {
        if (this.microtextService.validation(this.validationFuncs, this.environment)) {
            this.environmentsService.addEnv(this.projectId, this.environment).then(result => {
                // In case of server error.
                if (!result) {
                    this.snackbarService.snackbar("Server error occurred");
                }
                // In case the env name is exists.
                else if (result == "-1") {
                    $("#new-env-name-micro").html("The name is already in use");
                }
                else {
                    this.eventService.emit(EVENT_TYPE.ADD_ENVIRONMENT, this.environment);
                    this.currWindowType = WINDOW_TYPE.LIST;
                    this.environment = new Environment();
                }
            });
        }
    }

    updateEnv() {

    }

    editEnv(env: Environment) {
        this.environment = new Environment().copy(env);
        this.currWindowType = WINDOW_TYPE.UPDATE;
    }

    duplicateEnv(values: any) {
        this.environment.values = JSON.parse(JSON.stringify(values));
        this.currWindowType = WINDOW_TYPE.ADD;
    }

    deleteEnv(name: string) {
        this.alertService.alert({
            title: "Delete Environment",
            text: "Are you sure you want to delete this environment?",
            type: ALERT_TYPE.DANGER,
            confirmFunc: () => {
                const isLastEnv: boolean = (this.environments.length == 1);

                this.environmentsService.deleteEnv(this.projectId, name).then(result => {
                    if (!result) {
                        this.snackbarService.snackbar("Server error occurred");
                    }
                    else {
                        this.eventService.emit(EVENT_TYPE.DELETE_ENVIRONMENT, name);

                        if (isLastEnv) {
                            this.currWindowType = WINDOW_TYPE.EMPTY;
                        }
                    }
                });
            }
        });
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}