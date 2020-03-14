import { Component, HostListener } from '@angular/core';
import { ProjectsService } from 'src/app/services/projects.service';
import { MicrotextService, InputFieldValidation } from 'src/app/services/global/microtext.service';

@Component({
    selector: 'project-card',
    templateUrl: './projectCard.html',
    providers: [ProjectsService],
    styleUrls: ['./projectCard.css']
})

export class ProjectCardComponent {

    name: string = "";
    validationFuncs: Array<InputFieldValidation>;

    constructor(private projectsService: ProjectsService,
        private microtextService: MicrotextService) {
        this.validationFuncs = [
            {
                isFieldValid(name: string) {
                    return !!name;
                },
                errMsg: "Please enter project name",
                fieldId: "name-micro",
                inputId: "name"
            }
        ];
    }

    addProject() {
        if (this.microtextService.validation(this.validationFuncs, this.name)) {
            this.projectsService.addProject(this.name);
        }
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        if (event.code == "Enter") {
            this.addProject();
        }
    }
}