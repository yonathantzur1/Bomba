import { Component, Input } from '@angular/core';

@Component({
    selector: 'environments',
    templateUrl: './environments.html',
    styleUrls: ['./environments.css']
})

export class EnvironmentsComponent {

    isAddEnvironment: boolean = false;

    envName: string;
    envValues: any = {};

    constructor() { }

    addEnv() {
        
    }

}