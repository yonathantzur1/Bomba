import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Pipes
import { SortObjects } from '../../pipes/sort/sort.pipe';

// Components
import { AppComponent } from '../../components/app/app.component';
import { LoaderSpinnerComponent } from '../../components/loaders/loaderSpinner/loaderSpinner.component';
import { LoaderDotsComponent } from '../../components/loaders/loaderDots/loaderDots.component';
import { LoaderRingsComponent } from '../../components/loaders/loaderRings/loaderRings.component';
import { AlertComponent } from '../../components/alert/alert.component';
import { SnackbarComponent } from '../../components/snackbar/snackbar.component';
import { WelcomeComponent } from '../../components/welcome/welcome.component';
import { LoginComponent } from '../../components/welcome/login/login.component';
import { RegisterComponent } from '../../components/welcome/register/register.component';
import { ForgotComponent } from '../../components/welcome/forgot/forgot.component';
import { HomeComponent } from '../../components/home/home.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { TopNavbarComponent } from '../../components/navbar/topNavbar/topNavbar.component';
import { SideNavbarComponent } from '../../components/navbar/sideNavbar/sideNavbar.component';
import { MainSearchComponent } from '../../components/navbar/mainSearch/mainSearch.component';
import { DropMenuComponent } from '../../components/dropMenu/dropMenu.component';
import { ProfilePictureEditComponent } from '../../components/profilePicture/profilePictureEdit/profilePictureEdit.component';
import { ProfilePictureComponent } from '../../components/profilePicture/profilePicture.component';
import { ChatComponent } from '../../components/chat/chat.component';
import { ChatsWindowComponent } from '../../components/navbar/chatsWindow/chatsWindow.component';
import { FriendRequestsWindowComponent } from '../../components/navbar/friendRequestsWindow/friendRequestsWindow.component';
import { ManagementPanelComponent } from '../../components/managementPanel/managementPanel.component';
import { ManagementComponent } from '../../components/managementPanel/management/management.component';
import { StatisticsComponent } from '../../components/managementPanel/statistics/statistics.component';
import { UsersReportsComponent } from '../../components/managementPanel/usersReports/usersReports';
import { PermissionsCardComponent } from '../../components/managementPanel/management/permissionsCard/permissionsCard.component';
import { UserPageComponent } from '../../components/userPage/userPage.component';
import { UserEditWindowComponent } from '../../components/userPage/userEditWindow/userEditWindow.component';
import { UserReportWindowComponent } from '../../components/userPage/userReportWindow/userReportWindow.component';
import { UserPasswordWindowComponent } from '../../components/userPage/userPasswordWindow/userPasswordWindow.component';
import { UserPrivacyWindowComponent } from '../../components/userPage/userPrivacyWindow/userPrivacyWindow.component';
import { SearchPageComponent } from '../../components/searchPage/searchPage.component';
import { PageNotFoundComponent } from '../../components/pageNotFound/pageNotFound.component';
import { ForgotPasswordComponent } from '../../components/forgotPassword/forgotPassword.component';
import { DeleteUserComponent } from '../../components/deleteUser/deleteUser.component';

// Guards
import { AuthGuard } from '../../guards/auth.guard';
import { RootAuthGuard } from '../../guards/rootAuth.guard';
import { LoginGuard } from '../../guards/login.guard';

// Routing
import { Routing } from '../../routes/app.routing';

// Global services
import { AuthService } from '../../services/global/auth.service';
import { GlobalService } from '../../services/global/global.service';
import { EventService } from '../../services/global/event.service';
import { AlertService } from '../../services/global/alert.service';
import { CookieService } from '../../services/global/cookie.service';
import { SnackbarService } from '../../services/global/snackbar.service';
import { MicrotextService } from '../../services/global/microtext.service';
import { DateService } from '../../services/global/date.service';
import { SocketService } from 'src/app/services/global/socket.service';
import { PermissionsService } from 'src/app/services/global/permissions.service';
import { ImageService } from 'src/app/services/global/image.service';

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
    LoaderSpinnerComponent,
    LoaderDotsComponent,
    LoaderRingsComponent,
    AlertComponent,
    SnackbarComponent,
    WelcomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotComponent,
    NavbarComponent,
    TopNavbarComponent,
    SideNavbarComponent,
    MainSearchComponent,
    DropMenuComponent,
    ProfilePictureEditComponent,
    ProfilePictureComponent,
    ChatComponent,
    ChatsWindowComponent,
    FriendRequestsWindowComponent,
    ManagementPanelComponent,
    ManagementComponent,
    StatisticsComponent,
    UsersReportsComponent,
    PermissionsCardComponent,
    UserPageComponent,
    UserEditWindowComponent,
    UserReportWindowComponent,
    UserPasswordWindowComponent,
    UserPrivacyWindowComponent,
    SearchPageComponent,
    HomeComponent,
    PageNotFoundComponent,
    ForgotPasswordComponent,
    DeleteUserComponent,
    // -----Pipes-----
    SortObjects
  ],
  providers: [
    // -----Guards-----
    AuthGuard,
    RootAuthGuard,
    LoginGuard,
    // -----Global services-----
    AuthService,
    GlobalService,
    EventService,
    AlertService,
    CookieService,
    SnackbarService,
    MicrotextService,
    DateService,
    SocketService,
    PermissionsService,
    ImageService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }