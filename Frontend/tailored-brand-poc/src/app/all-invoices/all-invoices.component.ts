import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../service/invoice.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-all-invoices',
  templateUrl: './all-invoices.component.html',
  styleUrls: ['./all-invoices.component.css']
})
export class AllInvoicesComponent implements OnInit {
  invoiceForm: FormGroup;
  orderId: number;
  constructor(private invoiceService: InvoiceService) { }

  quantity = []
  cost = []
  invoice = []
  orderNo
  ngOnInit() {
    this.invoiceForm = new FormGroup({
      invoiceNo: new FormControl('', [Validators.required]),
      invoiceFromDate: new FormControl('', [Validators.required]),
      invoiceToDate: new FormControl('', [Validators.required]),
      orderNo: new FormControl('', [Validators.required]),
      invoiceAmount: new FormControl()

    });
  }
  getItemOrderDetail(event) {
    if (event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90))
      return false
    else {
      let orderID = this.invoiceForm.get('orderNo').value
      if (event.keyCode === 13 && orderID != '') {
        // orderID = '150344'
        this.invoiceService.getParticularOrder(orderID)
          .subscribe((res: any) => {
            console.log(res)
            this.cost = res.cost
            this.quantity = res.quantity
            this.orderNo = res.orderID
            this.invoice = res.ids
            // this.orderNo = res.
            // this.orderId=res.obj['@_ID']
            // this.setItemOrderDetails(res)
          })
      }
    }
  }
  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90) ? false : true
  }
}
