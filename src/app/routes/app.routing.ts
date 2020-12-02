import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { LoginComponent } from '../components/login/login.component';
import { ResetPasswordComponent } from '../components/resetPassword/resetPassword.component';
import { ForgotPasswordComponent } from '../components/forgotPassword/forgotPassword.component';
import { RegisterComponent } from '../components/register/register.component';
import { HomeComponent } from '../components/home/home.component';
import { ProjectsComponent } from '../components/projects/projects.component';
import { ReportsComponent } from '../components/reports/reports.component';
import { BoardComponent } from '../components/board/board.component';
import { UsersComponent } from '../components/admin/users/users.component';
import { StatisticsComponent } from '../components/admin/statistics/statistics.component';
import { TrackerComponent } from '../components/admin/tracker/tracker.component';
import { ApiManagerComponent } from '../components/apiManager/apiManager.component';
import { PageNotFoundComponent } from '../components/pageNotFound/pageNotFound.component';

// Guards
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { LoginGuard } from '../guards/login.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
  { path: 'forgot', component: ForgotPasswordComponent, canActivate: [LoginGuard] },
  { path: 'reset-password/:resetCode', component: ResetPasswordComponent },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ProjectsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'board/:id', component: BoardComponent },
      { path: 'api', component: ApiManagerComponent },
      { path: 'users', component: UsersComponent, canActivate: [AdminGuard] },
      { path: 'statistics', component: StatisticsComponent, canActivate: [AdminGuard] },
      { path: 'tracker', component: TrackerComponent, canActivate: [AdminGuard] },
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