import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../service/invoice.service';
<<<<<<< HEAD
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';
import{Router} from '@angular/router'
=======
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

>>>>>>> 91ce0f0ecc9fd32a49ea55f338d0bb0048211a83

@Component({
  selector: 'app-all-invoices',
  templateUrl: './all-invoices.component.html',
  styleUrls: ['./all-invoices.component.css']
})
export class AllInvoicesComponent implements OnInit {
<<<<<<< HEAD
  invoiceForm : FormGroup;
  orderId:number;
  constructor(private router: Router,private invoiceService : InvoiceService) { }
=======
  invoiceForm: FormGroup;
  orderId: number;
  constructor(private invoiceService: InvoiceService) { }
>>>>>>> 91ce0f0ecc9fd32a49ea55f338d0bb0048211a83

  quantity = []
  cost = []
  invoice = []
  orderNo
  invoiceData:any;

  ngOnInit() {
    this.invoiceForm = new FormGroup({
<<<<<<< HEAD
      invoiceNo : new FormControl('',[Validators.required]),
      invoiceDate: new FormControl('',[Validators.required]),
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
=======
      invoiceNo: new FormControl('', [Validators.required]),
      invoiceFromDate: new FormControl('', [Validators.required]),
      invoiceToDate: new FormControl('', [Validators.required]),
      orderNo: new FormControl('', [Validators.required]),
      invoiceAmount: new FormControl()

   });
   this.invoiceService.allInvoice()
   .subscribe((res: any)=>{
     this.invoiceData=res.data
   })
  }
  getItemOrderDetail(event) {
    if (event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90))
      return false
    else {
      let orderID = this.invoiceForm.get('orderNo').value
      if (event.keyCode === 13 && orderID != '') {
        this.invoiceService.getParticularOrder(orderID)
          .subscribe((res: any) => {
            this.cost = res.cost
            this.quantity = res.quantity
            this.orderNo = res.orderID
            this.invoice = res.ids

          })
      }
    }
>>>>>>> 91ce0f0ecc9fd32a49ea55f338d0bb0048211a83
  }
  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90) ? false : true
  }
}
