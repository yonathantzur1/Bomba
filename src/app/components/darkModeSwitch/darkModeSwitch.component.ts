import { Component, Input, OnInit } from "@angular/core";
import { GlobalService } from "src/app/services/global/global.service";

@Component({
    selector: 'dark-mode-switch',
    templateUrl: './darkModeSwitch.html',
    providers: [],
    styleUrls: ['./darkModeSwitch.css']
})

export class DarkModeSwitchComponent implements OnInit {
    constructor(private globalService: GlobalService) { }

    ngOnInit() {
        this.globalService.setDarkMode(this.globalService.isDarkMode);
    }

    changeTheme() {
        this.globalService.setDarkMode(!this.globalService.isDarkMode);
    }
}