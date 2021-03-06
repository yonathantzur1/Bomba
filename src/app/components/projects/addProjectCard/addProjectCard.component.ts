import { Component, OnInit, HostListener, Input } from '@angular/core';
import { ProjectsService } from 'src/app/services/projects.service';
import { MicrotextService, InputValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

import { Project } from '../project/project.component';

declare const $: any;

@Component({
    selector: 'add-project-card',
    templateUrl: './addProjectCard.html',
    providers: [ProjectsService],
    styleUrls: ['./addProjectCard.css']
})

export class AddProjectCardComponent implements OnInit {

    @Input() editProject: Project;

    name: string = "";
    validations: Array<InputValidation>;

    constructor(private eventService: EventService,
        private microtextService: MicrotextService,
        private snackbarService: SnackbarService,
        private projectsService: ProjectsService) {
        this.validations = [
            {
                isFieldValid(name: string) {
                    name = name.trim();
                    return !!name;
                },
                errMsg: "Please enter project name.",
                fieldId: "name-micro",
                inputId: "name"
            }
        ];
    }

    ngOnInit() {
        $("#name").focus();

        if (this.editProject) {
            this.name = this.editProject.name;
        }
    }

    addProject() {
        if (this.microtextService.validation(this.validations, this.name)) {
            let actionPromise: Promise<any>;
            let actionEventType: EVENT_TYPE;

            if (this.editProject) {
                actionPromise = this.projectsService.editProject(this.editProject.id, this.name);
                actionEventType = EVENT_TYPE.EDIT_PROJECT;
            }
            else {
                actionPromise = this.projectsService.addProject(this.name);
                actionEventType = EVENT_TYPE.ADD_PROJECT;
            }

            actionPromise.then(data => {
                if (!data) {
                    this.snackbarService.error();
                }
                else if (data.result == false) {
                    this.microtextService.showMicrotext("name-micro",
                        "The project name is already in use.")
                }
                else {
                    this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                    this.eventService.emit(actionEventType, data.result);
                }
            });
        }
    }

    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.key == "Enter") {
            this.addProject();
        }
    }
}