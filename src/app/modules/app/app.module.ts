import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { AppComponent } from '../../components/app/app.component';
import { BoardComponent } from '../../components/board/board.component';
import { MatrixComponent } from '../../components/board/matrix/matrix.component';
import { CellComponent } from '../../components/board/matrix/cell/cell.component';

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
    BoardComponent,
    MatrixComponent,
    CellComponent
  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})

export class AppModule { }