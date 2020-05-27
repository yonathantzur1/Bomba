import { Component, Input } from '@angular/core';

@Component({
    selector: 'key-value',
    templateUrl: './keyValue.html',
    providers: [],
    styleUrls: ['./keyValue.css']
})

export class KeyValueComponent {

    @Input() json: any;

    constructor() { }

    getJsonKeys(json: any) {
        return Object.keys(json);
    }

}