import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pageNotFound',
  templateUrl: './pageNotFound.html',
  styleUrls: ['./pageNotFound.css']
})

export class PageNotFoundComponent implements OnInit {
  numOfMonsters: number = 9;
  monsterImage: string;

  constructor(private router: Router) { }

  ngOnInit() {
    this.monsterImage = this.getRandomMonsterImage();
  }

  getRandomMonsterImage() {
    // Rundom monster number.
    let imageNumber = Math.floor(Math.random() * this.numOfMonsters) + 1;

    return ("monster" + imageNumber + ".png");
  }

  mainRoute() {
    this.router.navigateByUrl('/');
  }
}