import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'home',
    templateUrl: './home.html',
    providers: [],
    styleUrls: ['./home.css']
})

export class HomeComponent implements OnInit {
    
    currUser: any = null;

    constructor(private router: Router) { }

    ngOnInit() {
    }
}