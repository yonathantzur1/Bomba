import { Component } from '@angular/core';
import { ApiManagerService } from 'src/app/services/apiManager.service';

@Component({
    selector: 'api-manager',
    templateUrl: './apiManager.html',
    providers: [ApiManagerService],
    styleUrls: ['./apiManager.css']
})

export class ApiManagerComponent {

    constructor(private apiManagerService: ApiManagerService) { }

    copyApiKey() {
        
    }

}