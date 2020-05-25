import { Component, Input } from '@angular/core';

export class Tab {
    name: string;
    isActive: boolean;

    constructor(name: string, isActive: boolean) {
        this.name = name;
        this.isActive = isActive;
    }
}

@Component({
    selector: 'request-navbar',
    templateUrl: './requestNavbar.html',
    providers: [],
    styleUrls: ['./requestNavbar.css']
})

export class RequestNavbarComponent {

    @Input() tabs: Array<Tab>;

    tabWidth: number = 65;

    constructor() { }

    selectTab(index: number) {
        this.tabs.forEach(tab => {
            tab.isActive = false;
        });

        this.tabs[index].isActive = true;
    }

    getSelectedTabIndex() {
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].isActive) {
                return i;
            }
        }

        return 0;
    }

}