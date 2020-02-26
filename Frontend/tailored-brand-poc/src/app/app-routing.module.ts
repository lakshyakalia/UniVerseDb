import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VendorSignUpComponent } from './vendor-sign-up/vendor-sign-up.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { AllPurchaseOrdersComponent } from './purchase-order/all-purchase-orders/all-purchase-orders.component';
import { AllVendorsComponent } from './all-vendors/all-vendors.component';
import { AllInvoicesComponent } from './all-invoices/all-invoices.component';


const routes: Routes = [
  { path: '' , component: HomeComponent},
  { path: 'vendor/new' , component: VendorSignUpComponent},
  { path: 'invoice/new' , component: InvoiceDetailComponent },
  { path: 'order/new' , component: PurchaseOrderComponent },
  { path: 'order' , component: AllPurchaseOrdersComponent},
  { path: 'vendors' , component : AllVendorsComponent},
  { path: 'invoices' , component : AllInvoicesComponent},
  { path: 'order/edit', component: PurchaseOrderComponent},
  { path: 'vendor/edit', component: VendorSignUpComponent},
  { path: 'invoice/edit', component: InvoiceDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
