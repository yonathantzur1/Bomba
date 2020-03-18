import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';

import { DefaultSettings } from '../components/requestSettings/requestSettings.component';

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

    editProject(id: string, name: string) {
        return super.put('/editProject', { id, name });
    }

    deleteProject(id: string) {
        return super.delete('/deleteProject?id=' + id);
    }

    saveRequestSettings(id: string, defaultSettings: DefaultSettings) {
        return super.put('/saveRequestSettings', { id, defaultSettings });
    }
}