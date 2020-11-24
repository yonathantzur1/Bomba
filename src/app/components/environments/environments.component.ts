import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { EnvironmentsService } from '../../services/environments.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { GlobalService } from 'src/app/services/global/global.service';

declare const $: any;

export class Environment {
    id: string;
    name: string;
    values: any;
    isActive: boolean;

    constructor() {
        this.name = "";
        this.values = {};
        this.isActive = false;
    }

    copy(env: Environment) {
        this.id = env.id;
        this.name = env.name;
        this.values = JSON.parse(JSON.stringify(env.values));
        this.isActive = env.isActive;

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

export class EnvironmentsComponent implements OnInit, OnChanges {

    @Input() projectId: string;
    @Input() environments: Array<Environment>;

    isAddEnvironment: boolean = false;
    environment: Environment = new Environment();
    validationFuncs: Array<InputFieldValidation>;

    currWindowType: WINDOW_TYPE;
    windowType: any = WINDOW_TYPE;

    isLoading: boolean = false;

    example = "{{variable}}";

    constructor(private environmentsService: EnvironmentsService,
        private alertService: AlertService,
        private snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        private socketService: SocketService,
        private globalService: GlobalService,
        private eventService: EventService) {
        this.validationFuncs = [
            {
                isFieldValid(env: Environment) {
                    const isValid = !!env.name;

                    if (isValid) {
                        env.name = env.name.trim()
                    }

                    return isValid;
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

    ngOnChanges(changes: SimpleChanges) {
        const envs = changes.environments ? changes.environments.currentValue : null;

        if (envs) {
            this.currWindowType = (envs.length == 0) ? WINDOW_TYPE.EMPTY : WINDOW_TYPE.LIST;
        }
    }

    isSyncAllow(projectId: string, userGuid: string) {
        return (this.projectId == projectId && this.globalService.userGuid != userGuid);
    }

    getSortEnvironments(environments: Array<Environment>) {
        return environments.sort((a: Environment, b: Environment) => {
            return a.name < b.name ? -1 : 1;
        });
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
            this.isLoading = true;
            this.environmentsService.addEnv(this.projectId, this.environment).then(data => {
                this.isLoading = false;

                // In case of server error.
                if (!data || !data.result) {
                    this.snackbarService.error();
                }
                // In case the env name is exists.
                else if (data.result == "-1") {
                    $("#new-env-name-micro").html("The name is already in use");
                }
                else {
                    this.environment.id = data.result;
                    this.eventService.emit(EVENT_TYPE.ADD_ENVIRONMENT, this.environment);

                    this.socketService.socketEmit('selfSync',
                        'syncAddedEnv',
                        {
                            "userGuid": this.globalService.userGuid,
                            "projectId": this.projectId,
                            "environment": this.environment
                        });

                    this.environment = new Environment();
                }
            });
        }
    }

    updateEnv() {
        if (this.microtextService.validation(this.validationFuncs, this.environment)) {
            this.isLoading = true;
            this.environmentsService.updateEnv(this.projectId, this.environment).then(result => {
                this.isLoading = false;

                if (!result) {
                    this.snackbarService.error();
                }
                else {
                    this.eventService.emit(EVENT_TYPE.UPDATE_ENVIRONMENT, this.environment);
                    this.currWindowType = WINDOW_TYPE.LIST;

                    this.socketService.socketEmit('selfSync',
                        'syncUpdatedEnv',
                        {
                            "userGuid": this.globalService.userGuid,
                            "projectId": this.projectId,
                            "environment": this.environment
                        });

                    this.environment = new Environment();
                }
            });
        }
    }

    editEnv(env: Environment) {
        this.environment = new Environment().copy(env);
        this.currWindowType = WINDOW_TYPE.UPDATE;
    }

    duplicateEnv(env: Environment) {
        let duplicateEnv = new Environment().copy(env);
        duplicateEnv.name = this.createCopyEvnName(env.name);

        this.isLoading = true;
        this.environmentsService.addEnv(this.projectId, duplicateEnv).then(data => {
            this.isLoading = false;

            // In case of server error.
            if (!data || !data.result || data.result == "-1") {
                this.snackbarService.error();
            }
            else {
                duplicateEnv.id = data.result;
                this.eventService.emit(EVENT_TYPE.ADD_ENVIRONMENT, duplicateEnv);
                this.socketService.socketEmit('selfSync',
                    'syncAddedEnv',
                    {
                        "userGuid": this.globalService.userGuid,
                        "projectId": this.projectId,
                        "environment": duplicateEnv
                    });
            }
        });
    }

    createCopyEvnName(name: string): string {
        const parts = name.split(" ");
        let lastValue: number;

        if (parts.length > 2) {
            try {
                lastValue = parseInt(parts[parts.length - 1]);
            }
            catch (e) {
                lastValue = null;
            }
        }

        let allNames: Map<string, boolean> = new Map();
        this.environments.forEach(env => {
            allNames.set(env.name, true);
        });
        let newName = "";

        if (lastValue && parts[parts.length - 2] == "Copy") {
            let baseName = "";

            for (let i = 0; i < parts.length - 1; i++) {
                baseName += parts[i] + " ";
            }

            do {
                newName = baseName + (++lastValue);
            }
            while (this.isEnvNameExists(newName, allNames));
        }
        else if (parts.length >= 2 && parts[parts.length - 1] == "Copy") {
            let index = 2;
            let baseName = name + " ";

            do {
                newName = baseName + (index++);
            }
            while (this.isEnvNameExists(newName, allNames));
        }
        else {
            newName = name + " Copy";

            if (this.isEnvNameExists(newName, allNames)) {
                return this.createCopyEvnName(newName);
            }
        }

        return newName;
    }

    isEnvNameExists(name: string, allNames: Map<string, boolean>): boolean {
        return !!allNames.get(name);
    }

    deleteEnv(envId: string) {
        this.alertService.alert({
            title: "Delete Environment",
            text: "Are you sure you want to delete this environment?",
            type: ALERT_TYPE.DANGER,
            confirmFunc: () => {
                this.isLoading = true;

                this.environmentsService.deleteEnv(this.projectId, envId).then(result => {
                    this.isLoading = false;

                    if (!result) {
                        this.snackbarService.error();
                    }
                    else {
                        this.eventService.emit(EVENT_TYPE.DELETE_ENVIRONMENT, envId);

                        this.socketService.socketEmit('selfSync',
                            'syncDeletedEnv',
                            {
                                "userGuid": this.globalService.userGuid,
                                "projectId": this.projectId,
                                "envId": envId
                            });
                    }
                });
            }
        });
    }

    closeWindow() {
        this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}
