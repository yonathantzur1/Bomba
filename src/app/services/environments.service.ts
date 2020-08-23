import { Injectable } from '@angular/core';

import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Environment } from '../components/environments/environments.component';


@Injectable()
export class EnvironmentsService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/environments");
    }

    addEnv(projectId: string, env: Environment) {
        const data = { projectId, env };

        return super.post('/addEnv', data);
    }
}