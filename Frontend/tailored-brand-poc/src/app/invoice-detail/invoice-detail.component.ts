import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { InvoiceService } from '../service/invoice.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceForm: FormGroup;
  editInvoice: boolean;
  heading: string = 'New Invoice Update';

  constructor(private invoiceService: InvoiceService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.invoiceForm = this.fb.group({
      invoiceNo : new FormControl(),
       invoiceDate: new FormControl(),
       orderNo : new FormControl(),
       invoiceAmount : new FormControl(),
      invoiceDetails: this.fb.array([])
    })
    // this.invoiceForm = new FormGroup({
       
    // });

    this.editInvoice = this.router.url.endsWith('/invoice/edit')

    if (this.editInvoice) {
      console.log("---")
      this.heading = 'Edit Invoice';
    }
  }

  initiateForm(ids,quantity): FormGroup{
    return this.fb.group({
      itemNo : new FormControl(ids),
      description : new FormControl(),
      quantityOrdered : new FormControl(quantity),
      quantityPending : [0],
      quantityReceived : new FormControl()
    })
  }

  createNewFormControl(cost,ids,quantity){
    const control = <FormArray>this.invoiceForm.controls['invoiceDetails']
    control.push(this.initiateForm(ids,quantity))
  }

  sub() {
    console.log(this.invoiceForm.value.invoiceNo);
    this.invoiceService.submitNewInvoice(this.invoiceForm.value)
      .subscribe((res) => {
        console.log(res)
      })
  }

  getItemOrderDetail(event) {
    let orderID = this.invoiceForm.get('orderNo').value
    if (event.keyCode === 13 && orderID != '') {
      this.invoiceService.getParticularOrder(orderID)
        .subscribe((res: any) => {
          let len = res.ids.length
          for(let i=0;i<len;i++){
            this.createNewFormControl(res.cost[i],res.ids[i],res.quantity[i])
          }
        })
    }
  }

  calculatePendingQuantity(index){
    let controlArray = <FormArray>this.invoiceForm.get('invoiceDetails')
    let pendingQuantity = controlArray.value[index].quantityReceived
    let quantityOrdered = controlArray.value[index].quantityOrdered
    let leftQuantity = quantityOrdered - pendingQuantity
    controlArray.controls[index].get('quantityPending').setValue(leftQuantity)
  }
}