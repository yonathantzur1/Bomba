import { Component, OnInit, HostListener, Input } from '@angular/core';
import { ProjectsService } from 'src/app/services/projects.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

import { Project } from '../project/project.component';

declare let $: any;

@Component({
    selector: 'project-name-card',
    templateUrl: './projectNameCard.html',
    providers: [ProjectsService],
    styleUrls: ['./projectNameCard.css']
})

export class ProjectNameCardComponent implements OnInit {

    @Input() editProject: Project;

    name: string = "";
    validationFuncs: Array<InputFieldValidation>;

    constructor(private eventService: EventService,
        private microtextService: MicrotextService,
        private snackbarService: SnackbarService,
        private projectsService: ProjectsService) {
        this.validationFuncs = [
            {
                isFieldValid(name: string) {
                    name = name.trim();
                    return !!name;
                },
                errMsg: "Please enter project name",
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
        if (this.microtextService.validation(this.validationFuncs, this.name)) {
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
                    this.snackbarService.snackbar("Server error occurred");
                }
                else if (data.result == false) {
                    $("#name-micro").html("The project name is already in use");
                }
                else {
                    this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                    this.eventService.emit(actionEventType, data.result);
                }
            });
        }
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.code == "Enter") {
            this.addProject();
        }
    }
}