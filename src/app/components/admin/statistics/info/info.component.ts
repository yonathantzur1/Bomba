import { Component, Input } from '@angular/core';
import { InfoCard } from './infoCard/infoCard.component';

@Component({
    selector: 'info',
    templateUrl: './info.html',
    styleUrls: ['./info.css']
})

export class InfoComponent {
    @Input() title: string;
    @Input() cards: Array<InfoCard>;
    
    constructor() { }

}