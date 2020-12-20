import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
    selector: 'header',
    templateUrl: './header.html',
    providers: [],
    styleUrls: ['./header.css']
})

export class HeaderComponent {

    @Input() isClickable: boolean = false;

    constructor(private router: Router,
        public globalService: GlobalService) { }

    navigateMain() {
        this.isClickable && this.router.navigateByUrl("/");
    }
}