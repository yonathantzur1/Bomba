import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { AppComponent } from '../../components/app/app.component';
import { LoginComponent } from '../../components/login/login.component';
import { AdminComponent } from '../../components/admin/admin.component';
import { RegisterComponent } from '../../components/admin/register/register.component';
import { AlertComponent } from '../../components/alert/alert.component';
import { SnackbarComponent } from '../../components/snackbar/snackbar.component';
import { BoardComponent } from '../../components/board/board.component';
import { MatrixComponent } from '../../components/board/matrix/matrix.component';
import { CellComponent } from '../../components/board/matrix/cell/cell.component';
import { CardComponent } from '../../components/card/card.component';
import { RequestCardComponent } from '../../components/requestCard/requestCard.component';
import { RequestSettingsComponent } from '../../components/requestSettings/requestSettings.component';
import { RequestsComponent } from '../../components/board/requests/requests.component';

import { LoaderDotsComponent } from '../../components/loaders/loaderDots/loaderDots.component';
import { LoaderRingsComponent } from '../../components/loaders/loaderRings/loaderRings.component';
import { LoaderSpinnerComponent } from '../../components/loaders/loaderSpinner/loaderSpinner.component';

// Guards
import { AuthGuard } from '../../guards/auth.guard';
import { LoginGuard } from '../../guards/login.guard';

// Global Services
import { EventService } from '../../services/global/event.service';
import { AlertService } from '../../services/global/alert.service';
import { SnackbarService } from '../../services/global/snackbar.service';
import { MicrotextService } from '../../services/global/microtext.service';
import { AuthService } from '../../services/global/auth.service';
import { CookieService } from '../../services/global/cookie.service';
import { GlobalService } from '../../services/global/global.service';
import { SocketService } from '../../services/global/socket.service';

// Routing
import { Routing } from '../../routes/app.routing';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    Routing
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    SnackbarComponent,
    LoaderDotsComponent,
    LoaderRingsComponent,
    LoaderSpinnerComponent,
    LoginComponent,
    AdminComponent,
    RegisterComponent,
    BoardComponent,
    MatrixComponent,
    CellComponent,
    CardComponent,
    RequestCardComponent,
    RequestSettingsComponent,
    RequestsComponent
  ],
  providers: [
    AuthGuard,
    LoginGuard,
    EventService,
    AlertService,
    SnackbarService,
    MicrotextService,
    AuthService,
    CookieService,
    GlobalService,
    SocketService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }