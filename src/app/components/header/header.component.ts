import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'header',
    templateUrl: './header.html',
    providers: [],
    styleUrls: ['./header.css']
})

export class HeaderComponent {

    @Input() isClickable: boolean = false;

    constructor(private router: Router) { }

    navigateMain() {
        this.isClickable && this.router.navigateByUrl("/");
    }
}