import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { AppComponent } from '../components/app/app.component';
import { LoaderDotsComponent } from '../components/loaders/loaderDots/loaderDots.component';
import { LoaderRingsComponent } from '../components/loaders/loaderRings/loaderRings.component';
import { LoaderSpinnerComponent } from '../components/loaders/loaderSpinner/loaderSpinner.component';
import { AlertComponent } from '../components/alert/alert.component';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';
import { LoginComponent } from '../components/login/login.component';
import { HomeComponent } from '../components/home/home.component';
import { ReportsComponent } from '../components/reports/reports.component';
import { ReportFolderComponent } from '../components/reports/reportFolder/reportFolder.component';
import { ReportDocumentComponent } from '../components/reports/reportFolder/reportDocument/reportDocument.component';
import { ReportComponent } from '../components/reports/reportFolder/report/report.component';
import { ReportNumbersComponent } from '../components/reports/reportFolder/report/reportNumbers/reportNumbers.component';
import { ReportMatrixComponent } from '../components/reports/reportFolder/report/reportMatrix/reportMatrix.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { UsersComponent } from '../components/admin/users/users.component';
import { UserCardComponent } from '../components/admin/users/userCard/userCard.component';
import { UserEditComponent } from '../components/admin/users/userCard/userEdit/userEdit.component';
import { StatisticsComponent } from '../components/admin/statistics/statistics.component';
import { TrackerComponent } from '../components/admin/tracker/tracker.component';
import { InfoComponent } from '../components/admin/statistics/info/info.component';
import { InfoCardComponent } from '../components/admin/statistics/info/infoCard/infoCard.component';
import { RegisterComponent } from '../components/register/register.component';
import { BoardComponent } from '../components/board/board.component';
import { MatrixComponent } from '../components/board/matrix/matrix.component';
import { CellComponent } from '../components/board/matrix/cell/cell.component'
import { ResultInfoComponent } from '../components/board/matrix/cell/resultInfo/resultInfo.component';
import { CardComponent } from '../components/card/card.component';
import { EnvironmentsComponent } from '../components/environments/environments.component';
import { RequestCardComponent } from '../components/requestCard/requestCard.component';
import { RequestNavbarComponent } from '../components/requestCard/requestNavbar/requestNavbar.component';
import { RequestBodyComponent } from '../components/requestCard/requestBody/requestBody.component';
import { RequestHeadersComponent } from '../components/requestCard/requestHeaders/requestHeaders.component';
import { RequestCookiesComponent } from '../components/requestCard/requestCookies/requestCookies.component';
import { KeyValueComponent } from '../components/keyValue/keyValue.component';
import { TestRequestComponent } from '../components/requestCard/testRequest/testRequest.component';
import { RequestSettingsComponent } from '../components/requestSettings/requestSettings.component';
import { TemplatesComponent } from '../components/board/templates/templates.component';
import { ProjectsComponent } from '../components/projects/projects.component';
import { ProjectComponent } from '../components/projects/project/project.component';
import { ProjectNameCardComponent } from '../components/projects/projectNameCard/projectNameCard.component';
import { ApiManagerComponent } from '../components/apiManager/apiManager.component';
import { ApiGeneratorComponent } from '../components/apiManager/apiGenerator/apiGenerator.component';
import { PageNotFoundComponent } from '../components/pageNotFound/pageNotFound.component';

// Guards
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { LoginGuard } from '../guards/login.guard';

// Global Services
import { EventService } from '../services/global/event.service';
import { AlertService } from '../services/global/alert.service';
import { SnackbarService } from '../services/global/snackbar.service';
import { MicrotextService } from '../services/global/microtext.service';
import { AuthService } from '../services/global/auth.service';
import { CookieService } from '../services/global/cookie.service';
import { GlobalService } from '../services/global/global.service';
import { SocketService } from '../services/global/socket.service';
import { DateService } from '../services/global/date.service';

// Routing
import { Routing } from '../routes/app.routing';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    Routing
  ],
  declarations: [
    // -----Components-----
    AppComponent,
    LoaderDotsComponent,
    LoaderRingsComponent,
    LoaderSpinnerComponent,
    AlertComponent,
    SnackbarComponent,
    LoginComponent,
    HomeComponent,
    ReportsComponent,
    ReportFolderComponent,
    ReportDocumentComponent,
    ReportComponent,
    ReportNumbersComponent,
    ReportMatrixComponent,
    NavbarComponent,
    UsersComponent,
    UserEditComponent,
    StatisticsComponent,
    TrackerComponent,
    UserCardComponent,
    InfoComponent,
    InfoCardComponent,
    RegisterComponent,
    BoardComponent,
    MatrixComponent,
    CellComponent,
    ResultInfoComponent,
    CardComponent,
    EnvironmentsComponent,
    RequestCardComponent,
    RequestNavbarComponent,
    RequestBodyComponent,
    RequestHeadersComponent,
    RequestCookiesComponent,
    KeyValueComponent,
    TestRequestComponent,
    RequestSettingsComponent,
    TemplatesComponent,
    ProjectsComponent,
    ProjectComponent,
    ProjectNameCardComponent,
    ApiManagerComponent,
    ApiGeneratorComponent,
    PageNotFoundComponent
  ],
  providers: [
    // -----Guards-----
    AuthGuard,
    AdminGuard,
    LoginGuard,
    // -----Global services-----
    EventService,
    AlertService,
    SnackbarService,
    MicrotextService,
    AuthService,
    CookieService,
    GlobalService,
    SocketService,
    DateService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }