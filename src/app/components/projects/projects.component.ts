import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsService } from 'src/app/services/projects.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';

class Project {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
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
        private projectsService: ProjectsService) {

        this.eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isShowNewProject = false;
        }, this.eventsIds);
    }
}