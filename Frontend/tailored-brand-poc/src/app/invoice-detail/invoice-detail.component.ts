import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { InvoiceService } from '../service/invoice.service';
import { VendorService } from '../service/vendor.service';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { PurchaseDialogBoxComponent } from '../purchase-order/purchase-dialog-box.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from "@angular/material";



@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceForm: FormGroup;
  editInvoice: boolean;
  heading: string = 'New Invoice';
  description: string;
  lastId: number;
  date: string;
  itemOrderError: boolean

  constructor(private vendorService: VendorService, private invoiceService: InvoiceService, private router: Router, private fb: FormBuilder, private dialog: MatDialog , public snackBar: MatSnackBar) { }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
       duration: 4000,
       
    });
 }
  ngOnInit() {
    this.invoiceForm = this.fb.group({
      invoiceNo: new FormControl('', [Validators.required]),
      invoiceDate: new FormControl('', [Validators.required]),
      orderNo: new FormControl('', [Validators.required]),
      invoiceAmount: new FormControl('', [Validators.required]),
      invoiceDetails: this.fb.array([])
    })

    this.editInvoice = this.router.url.endsWith('/invoice/edit')

    if (this.editInvoice) {
      this.heading = 'Edit Invoice';
    }
    this.vendorService.readItem()
      .subscribe((res: any) => {
        this.description = res.table
      })
    this.date = new Date().toISOString().substr(0, 10);

  }

  initiateForm(ids, quantity): FormGroup {
    return this.fb.group({
      itemNo: new FormControl(ids),
      description: new FormControl(),
      quantityOrdered: new FormControl(quantity),
      quantityPending: [0],
      quantityReceived: new FormControl()
    })
  }

  createNewFormControl(ids, quantity) {
    const control = <FormArray>this.invoiceForm.controls['invoiceDetails']
    control.push(this.initiateForm(ids, quantity))
  }

  submitInvoice(submitStatus) {

    if (!this.checkValidation()) {
      return;
    }
    console.log(this.invoiceForm.value);
    this.invoiceService.submitNewInvoice(this.invoiceForm.value, submitStatus)
      .subscribe((res) => {
        this.openSnackBar(`Invoice Created`, 'Dismiss')
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/invoice/new']);
      }); 
      })
  }


  getItemOrderDetail(event) {
    if (event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90))
      return false
    else {

      let orderID = this.invoiceForm.get('orderNo').value
      if (event.keyCode === 13 && orderID != '' && this.lastId != orderID) {
        this.lastId = this.invoiceForm.get('orderNo').value
        this.invoiceService.getParticularOrder(orderID)
          .subscribe((res: any) => {
            if (res.status == 200) {
              let len = res.ids.length
              for (let i = 0; i < len; i++) {
                this.createNewFormControl(res.ids[i], res.quantity[i])
              }
            }
            if (res.status == 404) {
              this.openSnackBar(`${res.message}`, 'Dismiss')
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/invoice/new']);
            }); 
            }
          })
      }
    }
  }
  getInvoiceDetail(event) {
    let invoiceId = this.invoiceForm.get('invoiceNo').value
    if (event.keyCode === 13 && invoiceId != '') {
      this.invoiceService.getInvoice(invoiceId)
        .subscribe((res: any) => {
          let len = res.ids.length
          for (let i = 0; i < len; i++) {
            this.createNewFormControl(res.ids[i], res.quantity[i])
          }
        })
    }
  }

  calculatePendingQuantity(index) {
    let controlArray = <FormArray>this.invoiceForm.get('invoiceDetails')
    let pendingQuantity = controlArray.value[index].quantityReceived
    let quantityOrdered = controlArray.value[index].quantityOrdered
    let leftQuantity = quantityOrdered - pendingQuantity
    controlArray.controls[index].get('quantityPending').setValue(leftQuantity)
  }
  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90) ? false : true
  }
  openDialogBox(msg) {
    this.dialog.open(PurchaseDialogBoxComponent, {
      width: '420px',
      data: { msg: msg }
    })
  }
  checkValidation() {
    let status = true
    if (this.invoiceForm.invalid) {
      this.invoiceForm.get('invoiceNo').markAsTouched()
      this.invoiceForm.get('invoiceDate').markAsTouched()
      this.invoiceForm.get('orderNo').markAsTouched()
      this.invoiceForm.get('invoiceAmount').markAsTouched()

      status = false
    }
    if (this.invoiceForm.untouched) this.itemOrderError = true
    else this.itemOrderError = false

    return status
  }
}