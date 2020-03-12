import { Component, OnInit } from '@angular/core';
import { InvoiceService, Invoice } from '../service/invoice.service';
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';
import{Router} from '@angular/router'

@Component({
  selector: 'app-all-invoices',
  templateUrl: './all-invoices.component.html',
  styleUrls: ['./all-invoices.component.css']
})
export class AllInvoicesComponent implements OnInit {
  invoiceForm : FormGroup;
  orderId:number;
  length = 100;
  pageSize = 10
  constructor(private router: Router,private invoiceService : InvoiceService) { }

  quantity = []
  cost = []
  invoice = []
  orderNo
  invoiceData: Invoice[] = [];

  ngOnInit() {
    this.invoiceForm = new FormGroup({
      invoiceNo : new FormControl('',[Validators.required]),
      invoiceFromDate: new FormControl('',[Validators.required]),
      invoiceToDate: new FormControl('',[Validators.required]),
      orderNo : new FormControl('',[Validators.required])
   });
   this.invoiceService.list()
   .subscribe((res)=>{
      this.invoiceData = res
    })
  }

  openParticularOrder(orderId){
    this.router.navigate([`/invoice/edit/${orderId}`])
  }

  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90) ? false : true
  }

  filterInvoiceNo(event,invoiceForm){
    // if(event.keyCode === 13){
      this.invoiceService.list(invoiceForm.value)
      .subscribe((res:any)=>{
        this.invoiceData = res
      })
    // }
  }
  pagination(event){
    console.log(event)
  }
}
