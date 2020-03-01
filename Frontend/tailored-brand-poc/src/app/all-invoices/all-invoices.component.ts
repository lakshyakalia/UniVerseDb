import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../service/invoice.service';
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';


@Component({
  selector: 'app-all-invoices',
  templateUrl: './all-invoices.component.html',
  styleUrls: ['./all-invoices.component.css']
})
export class AllInvoicesComponent implements OnInit {
  invoiceForm : FormGroup;
  orderId:number;
  constructor(private invoiceService : InvoiceService) { }

  quantity = []
  cost = []
  invoice = []
  orderNo 
  invoiceData:any;
  ngOnInit() {
    this.invoiceForm = new FormGroup({
      invoiceNo : new FormControl('',[Validators.required]),
      invoiceDate: new FormControl('',[Validators.required]),
      orderNo : new FormControl('',[Validators.required]),
      invoiceAmount : new FormControl()
      

   });
   this.invoiceService.allInvoice()
   .subscribe((res: any)=>{
     this.invoiceData=res.data
   })
  }
  getItemOrderDetail(event){
    let orderID = this.invoiceForm.get('orderNo').value
    if(event.keyCode === 13 && orderID != ''){
      this.invoiceService.getParticularOrder(orderID)
      .subscribe((res:any)=>{
        this.cost  = res.cost
        this.quantity = res.quantity
        this.orderNo = res.orderID
        this.invoice = res.ids
      })
    }
  }
}
