import { Component } from '@angular/core';
import { AlertService } from 'src/app/services/global/alert.service';

@Component({
    selector: 'app',
    templateUrl: './main.html'
})

export class AppComponent {
    constructor(private alertService: AlertService) { }
}