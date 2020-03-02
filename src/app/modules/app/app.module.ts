import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { AppComponent } from '../../components/app/app.component';
import { AlertComponent } from '../../components/alert/alert.component';
import { BoardComponent } from '../../components/board/board.component';
import { MatrixComponent } from '../../components/board/matrix/matrix.component';
import { CellComponent } from '../../components/board/matrix/cell/cell.component';
import { CardComponent } from '../../components/card/card.component';
import { RequestCardComponent } from '../../components/requestCard/requestCard.component';
import { RequestSettingsComponent } from '../../components/requestSettings/requestSettings.component';
import { RequestsComponent } from '../../components/board/requests/requests.component';

// Global Services
import { EventService } from '../../services/global/event.service';
import { AlertService } from '../../services/global/alert.service';
import { MicrotextService } from '../../services/global/microtext.service';

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
    BoardComponent,
    MatrixComponent,
    CellComponent,
    CardComponent,
    RequestCardComponent,
    RequestSettingsComponent,
    RequestsComponent
  ],
  providers: [
    EventService,
    AlertService,
    MicrotextService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }