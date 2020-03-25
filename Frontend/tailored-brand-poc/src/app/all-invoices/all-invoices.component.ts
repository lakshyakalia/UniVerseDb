import { Component, OnInit } from '@angular/core';
import { InvoiceService, Invoice } from '../service/invoice.service';
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';
import{Router} from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-all-invoices',
  templateUrl: './all-invoices.component.html',
  styleUrls: ['./all-invoices.component.css']
})
export class AllInvoicesComponent implements OnInit {
  orderId:number;
  length : number;
  pageIndex = 0
  pageSize = 5
  constructor(private router: Router,private invoiceService : InvoiceService,private snackBar: MatSnackBar) { }

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
    let values = this.invoiceForm.value
    values['allVendors'] = true
    this.list(values)
  }
  list(values){
    values['pageIndex'] = this.pageIndex
    values['pageSize'] = this.pageSize
    this.invoiceService.list(values)
    .subscribe((res:any) =>{
      this.length = res.totalInvoices
      this.invoiceData = res.data
    },error =>{
      this.length = error.error.totalInvoices
      this.invoiceData = error.error.data
      this.openSnackBar(error.error.msg,'Dismiss')
    })
  }
  openParticularInvoice(invoiceNo){
    this.router.navigate([`/invoice/edit/${invoiceNo}`])
  }

  paginateInvoices(){
    let values = this.invoiceForm.value
    values['allVendors'] = false
    this.list(values)
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 4000,
    });
  }
}