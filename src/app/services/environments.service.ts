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

    updateEnv(projectId: string, currEnvName: string, env: Environment) {
        const data = { projectId, currEnvName, env };

        return super.put('/updateEnv', data);
    }

    deleteEnv(projectId: string, envName: string) {
        return super.delete('/deleteEnv?projectId=' + projectId + "&envName=" + envName);
    }

    updateActiveEnv(projectId: string, envName: string) {
        const data = { projectId, envName };

        return super.put('/updateActiveEnv', data);
    }
}