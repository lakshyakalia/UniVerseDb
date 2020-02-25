import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';
import { InvoiceService } from '../service/invoice.service';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceForm : FormGroup;
  constructor(private invoiceService : InvoiceService) { }

  ngOnInit() {
    this.invoiceForm = new FormGroup({
       invoiceNo : new FormControl(),
       invoiceDate: new FormControl(),
       orderNo : new FormControl(),
       invoiceAmount : new FormControl()

    });
  }
  sub(){
    console.log(this.invoiceForm.value.invoiceNo);
   this.invoiceService.submitNewInvoice(this.invoiceForm.value)
   .subscribe((res)=>{
    console.log(res)
  })
  }
  getItemOrderDetail(event){
    let orderID = this.invoiceForm.get('orderNo').value
    if(event.keyCode === 13 && orderID != ''){
      // orderID = '150344'
      this.invoiceService.getParticularOrder(orderID)
      .subscribe((res:any)=>{
        console.log(res)
        // this.setItemOrderDetails(res)
      })
    }
  }
}