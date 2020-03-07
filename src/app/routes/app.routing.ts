import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from '../components/login/login.component';
import { BoardComponent } from '../components/board/board.component';

const routes: Routes = [
  { path: 'login', component: BoardComponent },
  { path: '', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class Routing { }