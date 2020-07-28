import { Component, Input, OnDestroy } from '@angular/core';
import { EventService, EVENT_TYPE } from 'src/app/services/global/event.service';
import { AlertService, ALERT_TYPE } from 'src/app/services/global/alert.service';
import { Router } from '@angular/router';

export class Project {
    id: string;
    name: string;
    date: Date;
    isSendMode: boolean;
    isSendDone: boolean;

    constructor(id: string, name: string, date: Date, isSendMode: boolean, isSendDone: boolean) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.isSendMode = isSendMode;
        this.isSendDone = isSendDone;
    }
}

@Component({
    selector: 'project',
    templateUrl: './project.html',
    styleUrls: ['./project.css']
})

export class ProjectComponent implements OnDestroy {
    @Input() project: Project;

    isEditProjectCard: boolean = false;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private alertService: AlertService,
        private eventService: EventService) {

        this.eventService.register(EVENT_TYPE.CLOSE_CARD, () => {
            this.isEditProjectCard = false;
        }, this.eventsIds);
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    formatDate(date: Date) {
        date = new Date(date);

        let day: any = date.getDate();
        let month: any = date.getMonth() + 1;
        let year: any = date.getFullYear().toString().substr(-2);

        if (day < 10) {
            day = "0" + day;
        }

        if (month < 10) {
            month = "0" + month;
        }

        return (day + '/' + month + '/' + year);
    }

    openProject() {
        this.router.navigateByUrl("/board/" + this.project.id);
    }

    openEditProjectName(event: any) {
        event.stopPropagation();
        this.isEditProjectCard = true;
    }

    deleteProject(event: any) {
        event.stopPropagation();
        this.alertService.alert({
            title: "Delete Project",
            text: 'Please confirm the deletion of the project "' + this.project.name + '"\n\n' +
                "The action will delete all data saved on the project and its reports.",
            type: ALERT_TYPE.DANGER,
            confirmFunc: () => {
                this.eventService.emit(EVENT_TYPE.DELETE_PROJECT, this.project.id);
            }
        });
    }
}