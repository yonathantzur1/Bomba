import { Component, Input } from '@angular/core';

@Component({
    selector: 'request-cookies',
    templateUrl: './requestCookies.html',
    styleUrls: ['./requestCookies.css']
})

export class RequestCookiesComponent {

    @Input() cookies: any;

    constructor() { }

}