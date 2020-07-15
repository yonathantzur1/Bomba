import { Component } from '@angular/core';
import { ApiManagerService } from 'src/app/services/apiManager.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

@Component({
    selector: 'api-manager',
    templateUrl: './apiManager.html',
    providers: [ApiManagerService],
    styleUrls: ['./apiManager.css']
})

export class ApiManagerComponent {

    apiKey: string;

    constructor(private apiManagerService: ApiManagerService,
        private snackbarService: SnackbarService) {
        this.apiManagerService.getApiKey().then(result => {
            if (result) {
                this.apiKey = result.key;
            }
            else {
                this.snackbarService.snackbar("Server error occurred");
            }
        });
    }

    copyApiKey() {
        const textArea = document.createElement('textarea');
        textArea.value = this.apiKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.snackbarService.snackbar("Copy successfully");
    }

}