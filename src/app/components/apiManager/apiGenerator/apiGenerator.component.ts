import { Component } from '@angular/core';
import { ApiManagerService } from 'src/app/services/apiManager.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

@Component({
    selector: 'api-generator',
    templateUrl: './apiGenerator.html',
    providers: [ApiManagerService],
    styleUrls: ['./apiGenerator.css']
})

export class ApiGeneratorComponent {

    constructor(private apiManagerService: ApiManagerService,
        private snackbarService: SnackbarService) {
    }

}