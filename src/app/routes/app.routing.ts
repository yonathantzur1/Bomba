import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomeComponent } from '../components/welcome/welcome.component';
import { LoginComponent } from '../components/welcome/login/login.component';
import { RegisterComponent } from '../components/welcome/register/register.component';
import { ForgotComponent } from '../components/welcome/forgot/forgot.component';
import { HomeComponent } from '../components/home/home.component';
import { ManagementPanelComponent } from '../components/managementPanel/managementPanel.component';
import { ManagementComponent } from '../components/managementPanel/management/management.component';
import { StatisticsComponent } from '../components/managementPanel/statistics/statistics.component';
import { UsersReportsComponent } from '../components/managementPanel/usersReports/usersReports';
import { UserPageComponent } from '../components/userPage/userPage.component';
import { SearchPageComponent } from '../components/searchPage/searchPage.component';
import { PageNotFoundComponent } from '../components/pageNotFound/pageNotFound.component';
import { ForgotPasswordComponent } from '../components/forgotPassword/forgotPassword.component';
import { DeleteUserComponent } from '../components/deleteUser/deleteUser.component';

import { AuthGuard } from '../guards/auth.guard';
import { RootAuthGuard } from '../guards/rootAuth.guard';
import { LoginGuard } from '../guards/login.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'panel', component: ManagementPanelComponent, canActivate: [RootAuthGuard] },
      { path: 'management', component: ManagementComponent, canActivate: [RootAuthGuard] },
      { path: 'management/:id', component: ManagementComponent, canActivate: [RootAuthGuard] },
      { path: 'statistics', component: StatisticsComponent, canActivate: [RootAuthGuard] },
      { path: 'reports', component: UsersReportsComponent, canActivate: [RootAuthGuard] },
      { path: 'profile/:id', component: UserPageComponent },
      { path: 'search/:name', component: SearchPageComponent }
    ]
  },
  {
    path: '',
    component: WelcomeComponent,
    children: [
      { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
      { path: 'forgot', component: ForgotComponent, canActivate: [LoginGuard] },
      { path: 'page-not-found', component: PageNotFoundComponent }
    ]
  },
  { path: 'forgot/:passToken', component: ForgotPasswordComponent },
  { path: 'delete/:passToken', component: DeleteUserComponent },
  { path: '**', redirectTo: 'page-not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class Routing { }