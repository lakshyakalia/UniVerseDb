import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';
import { InvoiceService } from '../service/invoice.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceForm : FormGroup;
  editInvoice : boolean;
  heading:string='New Invoice';
  toggle: boolean = false;
  constructor(private invoiceService : InvoiceService, private router: Router) { }

  ngOnInit() {
    this.invoiceForm = new FormGroup({
       invoiceNo : new FormControl('', [Validators.required]),
       invoiceDate: new FormControl('', [Validators.required]),
       orderNo : new FormControl('', [Validators.required]),
       invoiceAmount : new FormControl('', [Validators.required])

    });
    this.editInvoice = this.router.url.endsWith('/invoice/edit')
    console.log(this.editInvoice)
    if (this.editInvoice) {
      console.log("---")
      this.heading='Edit Invoice';
    }
    // else{
    //   this.vendorDetailForm.controls['vendorNo'].disable()
    // }
    // console.log(this.items.controls)
  }
  sub(){
    this.toggle=true;
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