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
  invoiceForm : FormGroup;
  orderId:number;
  length : number;
  pageIndex = 0
  pageSize = 5;
  constructor(private router: Router,private invoiceService : InvoiceService) { }

  quantity = []
  cost = []
  invoice = []
  orderNo
  invoiceData: Invoice[] = [];
  rowId : number = 0

  ngOnInit() {
    this.invoiceForm = new FormGroup({
      invoiceNo : new FormControl('',[Validators.required]),
      invoiceFromDate: new FormControl('',[Validators.required]),
      invoiceToDate: new FormControl('',[Validators.required]),
      orderNo : new FormControl('',[Validators.required])
   });
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
    this.paginateInvoices(this.pageIndex,this.pageSize)
  }
  paginateInvoices(pageIndex,pageSize){
    this.invoiceService.list(pageIndex,pageSize,true).subscribe((res:any) =>{
      this.length = res.totalOrders
      console.log(res)
    })
  }
}