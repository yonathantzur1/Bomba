import { Component, Input } from '@angular/core';

import { EnvironmentsService } from '../../services/environments.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

export class Environment {
    name: string;
    values: any;

    constructor() {
        this.name = "";
        this.values = {};
    }
}

@Component({
    selector: 'environments',
    templateUrl: './environments.html',
    providers: [EnvironmentsService],
    styleUrls: ['./environments.css']
})

export class EnvironmentsComponent {

    @Input() projectId: string;

    isAddEnvironment: boolean = false;
    newEnvironment: Environment = new Environment();

    constructor(private environmentsService: EnvironmentsService,
        private snackbarService: SnackbarService) { }

    addEnv() {
        this.environmentsService.addEnv(this.projectId, this.newEnvironment).then(result => {
            // In case the env name is exists.
            if (result == "-1") {

            }
            else if (result === true) {

            }
            else {
                this.snackbarService.snackbar("Server error occurred");
            }
        });
    }

}