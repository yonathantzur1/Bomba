import { Component, OnInit, OnDestroy } from '@angular/core';
import { Project } from './project/project.component';
import { ProjectsService } from 'src/app/services/projects.service';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
    selector: 'projects',
    templateUrl: './projects.html',
    providers: [ProjectsService],
    styleUrls: ['./projects.css']
})

export class ProjectsComponent implements OnInit, OnDestroy {

    projects: Array<Project>;
    isNewProjectCard: boolean = false;
    editProject: Project;

    isLoading: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private eventService: EventService,
        private globalService: GlobalService,
        private socketService: SocketService,
        private snackbarService: SnackbarService,
        private projectsService: ProjectsService) {

        eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isNewProjectCard = false;
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.ADD_PROJECT, (data: any) => {
            let project = new Project(data._id, data.name, data.date, false, false);
            this.addProject(project)

            this.socketService.socketEmit('selfSync', 'syncAddProject', {
                "userGuid": this.globalService.userGuid,
                project
            });
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.EDIT_PROJECT, (data: any) => {
            this.editProjectName(data._id, data.name);

            this.socketService.socketEmit('selfSync', 'syncEditProject', {
                "userGuid": this.globalService.userGuid,
                "projectId": data._id,
                "projectName": data.name
            });
        }, this.eventsIds);

        eventService.register(EVENT_TYPE.DELETE_PROJECT,
            this.deleteProject.bind(this),
            this.eventsIds);

        this.loadAllProjects();
    }

    ngOnInit() {
        this.socketService.socketOn("syncAddProject", (data: any) => {
            if (this.isSyncAllow(data.userGuid)) {
                this.addProject(data.project);
            }
        });

        this.socketService.socketOn("syncEditProject", (data: any) => {
            if (this.isSyncAllow(data.userGuid)) {
                this.editProjectName(data.projectId, data.projectName);
            }
        });

        this.socketService.socketOn("syncDeleteProject", (data: any) => {
            if (this.isSyncAllow(data.userGuid)) {
                this.projects = this.projects.filter(project => {
                    return project.id != data.projectId;
                });
            }
        });

        this.socketService.socketOn("syncSendRequests", (data: any) => {
            this.getProjectById(data.projectId).isSendMode = true;
            this.getProjectById(data.projectId).isSendDone = false;
        });

        this.socketService.socketOn("syncCloseReport", (data: any) => {
            this.getProjectById(data.projectId).isSendMode = false;
        });

        this.socketService.socketOn("finishReport", (projectId: string) => {
            this.getProjectById(projectId).isSendDone = true;
        });
    }

    ngOnDestroy() {
        this.socketService.socketOff(["syncAddProject", "syncEditProject", "syncDeleteProject",
            "syncSendRequests", "syncCloseReport", "finishReport"]);
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    isSyncAllow(userGuid: string) {
        return (this.globalService.userGuid != userGuid);
    }

    addProject(project: Project) {
        this.projects.push(project);
    }

    editProjectName(projectId: string, projectName: string) {
        this.getProjectById(projectId).name = projectName;
    }

    getProjectById(projectId: string): Project {
        return this.projects.find((project: Project) => {
            return project.id == projectId;
        });
    }

    loadAllProjects() {
        this.isLoading = true;

        this.projectsService.getProjects().then(data => {
            this.isLoading = false;

            if (data) {
                this.projects = data.map((project: any) => {
                    return new Project(project._id,
                        project.name,
                        project.date,
                        project.isSendMode,
                        project.isSendDone);
                });
            }
            else {
                this.snackbarService.error();
            }
        });
    }

    deleteProject(projectId: string) {
        let deleteProject: Project;
        let deleteIndex: number;

        for (let i = 0; i < this.projects.length; i++) {
            let currProject = this.projects[i];

            if (projectId == currProject.id) {
                deleteProject = currProject;
                deleteIndex = i;
                break;
            }
        }

        this.projects.splice(deleteIndex, 1);

        this.projectsService.deleteProject(projectId).then(result => {
            if (result) {
                this.socketService.socketEmit('selfSync', 'syncDeleteProject', {
                    "userGuid": this.globalService.userGuid,
                    projectId
                });
            }
            else {
                this.snackbarService.error();

                // Insert project back to the list in case of error.
                this.projects.splice(deleteIndex, 0, deleteProject);
            }
        });
    }
}