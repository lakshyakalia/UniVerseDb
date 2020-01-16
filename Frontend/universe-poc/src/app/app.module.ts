import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import { DisplayComponent } from './display/display.component';
import {HttpClientModule } from '@angular/common/http';
import { PostDataComponent } from './post-data/post-data.component'
import { FormsModule,ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule,MatInputModule } from '@angular/material'

@NgModule({
  declarations: [
    AppComponent,
    DisplayComponent,
    PostDataComponent
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
    MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
