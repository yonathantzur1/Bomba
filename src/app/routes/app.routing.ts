import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { LoginComponent } from '../components/login/login.component';
import { HomeComponent } from '../components/home/home.component';
import { AdminComponent } from '../components/admin/admin.component';
import { ProjectsComponent } from '../components/projects/projects.component';
import { BoardComponent } from '../components/board/board.component';
import { PageNotFoundComponent } from '../components/pageNotFound/pageNotFound.component';

// Guards
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { LoginGuard } from '../guards/login.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ProjectsComponent },
      { path: 'board/:id', component: BoardComponent },
      { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] }
    ]
  },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: "page-not-found" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class Routing { }