import { Component, Input } from '@angular/core';

@Component({
    selector: 'request-cookies',
    templateUrl: './requestCookies.html',
    providers: [],
    styleUrls: ['./requestCookies.css']
})

export class RequestCookiesComponent {

    @Input() cookies: any;

    constructor() {

    }

}