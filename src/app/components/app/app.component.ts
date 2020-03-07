import { Component } from '@angular/core';
import { AlertService } from 'src/app/services/global/alert.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';

@Component({
    selector: 'app',
    templateUrl: './main.html'
})

export class AppComponent {
    constructor(public alertService: AlertService,
        public snackbarService: SnackbarService) { }
}