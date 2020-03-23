import { Component, Input } from '@angular/core';

export class InfoCard {
    title: string;
    value: string;

    constructor(title: string, value: string) {
        this.title = title;
        this.value = value;
    }
}

@Component({
    selector: 'info-card',
    templateUrl: './infoCard.html',
    providers: [],
    styleUrls: ['./infoCard.css']
})

export class InfoCardComponent {
    users: Array<InfoCard>

    @Input() card: InfoCard;

    constructor() { }

}