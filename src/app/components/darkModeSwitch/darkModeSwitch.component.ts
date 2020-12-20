import { Component } from "@angular/core";
import { GlobalService } from "src/app/services/global/global.service";

@Component({
    selector: 'dark-mode-switch',
    templateUrl: './darkModeSwitch.html',
    providers: [],
    styleUrls: ['./darkModeSwitch.css']
})

export class DarkModeSwitchComponent {
    constructor(private globalService: GlobalService) { }

    changeTheme() {
        this.globalService.setDarkMode(!this.globalService.isDarkMode);
    }
}