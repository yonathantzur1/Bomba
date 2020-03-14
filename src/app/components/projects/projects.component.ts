import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsService } from 'src/app/services/projects.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

class Project {
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
    isShowNewProject: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private eventService: EventService,
        private snackbarService: SnackbarService,
        private projectsService: ProjectsService) {

        this.eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowNewProject = false;
        }, this.eventsIds);

        this.projectsService.getProjects().then((projects: Array<Project>) => {
            if (projects) {
                this.projects = projects;
            }
            else {
                this.snackbarService.snackbar("Server error occurred");
            }
        });
    }
}