import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VendorSignUpComponent } from './vendor-sign-up/vendor-sign-up.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { AllPurchaseOrdersComponent } from './all-purchase-orders/all-purchase-orders.component';
import { AllVendorsComponent } from './all-vendors/all-vendors.component';


const routes: Routes = [
  { path: '' , component: HomeComponent},
  { path: 'vendorRegistration' , component: VendorSignUpComponent},
  { path: 'newInvoice' , component: InvoiceDetailComponent },
  { path: 'newPurchaseOrder' , component: PurchaseOrderComponent },
  { path: 'allPurchaseOrders' , component: AllPurchaseOrdersComponent},
  { path: 'allVendors' , component : AllVendorsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
