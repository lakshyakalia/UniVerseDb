import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatStepperModule } from '@angular/material/stepper'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from './navbar/navbar.component';
import { VendorSignUpComponent } from './vendor-sign-up/vendor-sign-up.component'
import { HttpClientModule } from '@angular/common/http';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { HomeComponent } from './home/home.component';
import { AllPurchaseOrdersComponent } from './purchase-order/all-purchase-orders/all-purchase-orders.component';
import { FooterComponent } from './footer/footer.component';
import { AllVendorsComponent } from './all-vendors/all-vendors.component';
import { AllInvoicesComponent } from './all-invoices/all-invoices.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PurchaseDialogBoxComponent } from './purchase-order/purchase-dialog-box.component'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VendorSignUpComponent,
    PurchaseOrderComponent,
    InvoiceDetailComponent,
    HomeComponent,
    AllPurchaseOrdersComponent,
    FooterComponent,
    AllVendorsComponent,
    AllInvoicesComponent,
    PurchaseDialogBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents:[PurchaseDialogBoxComponent]
})
export class AppModule { }
