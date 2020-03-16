import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsService } from 'src/app/services/projects.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';

export class Project {
    id: string;
    name: string;
    date: Date;

    constructor(id: string, name: string, date: Date) {
        this.id = id;
        this.name = name;
        this.date = date;
    }
}

@Component({
    selector: 'projects',
    templateUrl: './projects.html',
    providers: [ProjectsService],
    styleUrls: ['./projects.css']
})

export class ProjectsComponent {

    projects: Array<Project>;
    isShowProjectCard: boolean = false;
    editProject: Project;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private eventService: EventService,
        private snackbarService: SnackbarService,
        private alertService: AlertService,
        private projectsService: ProjectsService) {

        this.eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowProjectCard = false;
            this.editProject = null;
        }, this.eventsIds);

        this.eventService.register(EVENT_TYPE.ADD_PROJECT, (project: any) => {
            this.projects.push(new Project(project._id, project.name, project.date))
        }, this.eventsIds);

        this.eventService.register(EVENT_TYPE.EDIT_PROJECT, (project: any) => {
            for (let i = 0; i < this.projects.length; i++) {
                if (this.projects[i].id == project._id) {
                    this.projects[i].name = project.name;
                }
            }

            this.editProject = null;
        }, this.eventsIds);

        this.loadAllProjects();
    }

    loadAllProjects() {
        this.projectsService.getProjects().then(projects => {
            if (projects) {
                this.projects = projects.map((project: { _id: string; name: string; date: Date; }) => {
                    return new Project(project._id, project.name, project.date);
                });
            }
            else {
                this.snackbarService.snackbar("Server error occurred");
            }
        });
    }

    openProject(id: string) {
        this.router.navigateByUrl("/board/" + id);
    }

    edit(project: Project, event: any) {
        event.stopPropagation();
        this.editProject = project;
        this.isShowProjectCard = true;
    }

    deleteProject(project: Project, event: any) {
        event.stopPropagation();
        this.alertService.alert({
            title: "Delete Project",
            text: "Please confirm delete the project: " + project.name + "\n\n" +
                "The action will delete all matrix, requests and data saved on the project.",
            type: ALERT_TYPE.DANGER,
            confirmFunc: () => {
                let deleteProject: Project;
                let deleteIndex: number;

                for (let i = 0; i < this.projects.length; i++) {
                    let project = this.projects[i];

                    if (project.id == project.id) {
                        deleteProject = project;
                        deleteIndex = i;
                        break;
                    }
                }

                this.projects.splice(deleteIndex, 1);

                this.projectsService.deleteProject(project.id).then(result => {
                    if (!result) {
                        this.snackbarService.snackbar("Server error occurred");

                        // Return false deleted project to the projects list.
                        this.projects.splice(deleteIndex, 0, deleteProject);
                    }
                });
            }
        });
    }
}