import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { LoginComponent } from '../components/login/login.component';
import { AdminComponent } from '../components/admin/admin.component';
import { BoardComponent } from '../components/board/board.component';

// Guards
import { LoginGuard } from '../guards/login.guard';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: '', component: BoardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'admin', component: AdminComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class Routing { }