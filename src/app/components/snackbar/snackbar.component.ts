import { Component } from '@angular/core';

import { SnackbarService } from '../../services/global/snackbar.service';

@Component({
    selector: 'snackbar',
    templateUrl: './snackbar.html',    
    styleUrls: ['./snackbar.css']
})

export class SnackbarComponent {
    constructor(public snackbarService: SnackbarService) { }
}