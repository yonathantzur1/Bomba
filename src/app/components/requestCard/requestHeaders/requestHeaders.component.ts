import { Component, Input } from '@angular/core';

@Component({
    selector: 'request-headers',
    templateUrl: './requestHeaders.html',
    providers: [],
    styleUrls: ['./requestHeaders.css']
})

export class RequestHeadersComponent {

    @Input() headers: any;

    constructor() {

    }

}