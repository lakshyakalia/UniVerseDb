import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import { DisplayComponent } from './display/display.component';
import {HttpClientModule } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule,MatInputModule,MatSnackBarModule } from '@angular/material';
import { WriteDataComponent } from './write-data/write-data.component'
import { ReaddataComponent } from './readdata/readdata.component'

@NgModule({
  declarations: [
    AppComponent,
    DisplayComponent,
    WriteDataComponent,
    ReaddataComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
