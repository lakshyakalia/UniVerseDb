import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../service/invoice.service';
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
  constructor(private router: Router,private invoiceService : InvoiceService) { }

  quantity = []
  cost = []
  invoice = []
  orderNo
  invoiceData:any;

  ngOnInit() {
    this.invoiceForm = new FormGroup({
      invoiceNo : new FormControl('',[Validators.required]),
      invoiceFromDate: new FormControl('',[Validators.required]),
      invoiceToDate: new FormControl('',[Validators.required]),
      orderNo : new FormControl('',[Validators.required]),
      invoiceAmount : new FormControl()
        

   });
   this.invoiceService.allInvoice()
   .subscribe((res:any)=>{
     this.invoiceData=res.data
   })
  }
  openParticularOrder(orderId){
    this.router.navigate([`/invoice/edit/${orderId}`])
  }
  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90) ? false : true
  }
}
