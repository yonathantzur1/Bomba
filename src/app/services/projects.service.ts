import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProjectsService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/projects");
    }

    getProjects() {
        return super.get('/getProjects');
    }

    addProject(name: string) {
        return super.post('/addProject', { name });
    }

}