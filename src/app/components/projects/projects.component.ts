import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'projects',
    templateUrl: './projects.html',
    styleUrls: ['./projects.css']
})

export class ProjectsComponent {

    constructor(private router: Router) { }
}