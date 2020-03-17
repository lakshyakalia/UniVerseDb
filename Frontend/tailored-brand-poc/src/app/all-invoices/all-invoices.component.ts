import { Component, OnInit } from '@angular/core';
import { InvoiceService, Invoice } from '../service/invoice.service';
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';
import{Router} from '@angular/router'
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-all-invoices',
  templateUrl: './all-invoices.component.html',
  styleUrls: ['./all-invoices.component.css']
})
export class AllInvoicesComponent implements OnInit {
  orderId:number;
  length : number;
  pageIndex = 0
  pageSize = 5;
  constructor(private router: Router,private invoiceService : InvoiceService) { }

  orderNo
  invoiceData: Invoice[] = [];
  rowId : number = 0

  invoiceForm = new FormGroup({
    invoiceNo : new FormControl('',[Validators.required]),
    invoiceFromDate: new FormControl('',[Validators.required]),
    invoiceToDate: new FormControl('',[Validators.required]),
    orderNo : new FormControl('',[Validators.required])
 });

  ngOnInit() {
    
    let event = {
      pageIndex : this.pageIndex,
      pageSize : this.pageSize
    }
    this.pagination(event)
  }

  openParticularOrder(orderId){
    this.router.navigate([`/invoice/edit/${orderId}`])
  }

  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90) ? false : true
  }

  pagination(event){
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
    this.rowId = this.pageIndex * this.pageSize + 1
    this.paginateInvoices()
  }
  paginateInvoices(){
    let values = this.invoiceForm.value
    values['pageIndex'] = this.pageIndex
    values['pageSize'] = this.pageSize
    this.invoiceService.list(values).subscribe((res:any) =>{
      console.log(res)
      this.length = res.totalOrder
    })
  }
}