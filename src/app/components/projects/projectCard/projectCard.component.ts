import { Component, OnInit, HostListener, Input } from '@angular/core';
import { ProjectsService } from 'src/app/services/projects.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

import { Project } from '../projects.component';

declare let $: any;

@Component({
    selector: 'project-card',
    templateUrl: './projectCard.html',
    providers: [ProjectsService],
    styleUrls: ['./projectCard.css']
})

export class ProjectCardComponent implements OnInit {

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
            if (this.editProject) {
                this.projectsService.editProject(this.editProject.id, this.name).then(data => {
                    if (!data) {
                        this.snackbarService.snackbar("Server error occurred");
                    }
                    else if (data.result == false) {
                        $("#name-micro").html("The project name is already in use");
                    }
                    else {
                        this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                        this.eventService.emit(EVENT_TYPE.EDIT_PROJECT, data.result);
                    }
                });
            }
            else {
                this.projectsService.addProject(this.name).then(data => {
                    if (!data) {
                        this.snackbarService.snackbar("Server error occurred");
                    }
                    else if (data.result == false) {
                        $("#name-micro").html("The project name is already in use");
                    }
                    else {
                        this.eventService.emit(EVENT_TYPE.CLOSE_CARD);
                        this.eventService.emit(EVENT_TYPE.ADD_PROJECT, data.result);
                    }
                });
            }
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