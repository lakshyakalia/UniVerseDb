import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray, ControlContainer } from '@angular/forms';
import { InvoiceService } from '../service/invoice.service';
import { VendorService } from '../service/vendor.service';
import { Router } from '@angular/router';
import { PurchaseDialogBoxComponent } from '../purchase-order/purchase-dialog-box.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from "@angular/material";
import { ItemService } from '../service/item.service';
import { PurchaseOrderService } from '../service/purchase-order.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  quantityReceivedGreater: boolean = false;
  invoiceForm: FormGroup;
  editInvoice: boolean;
  heading: string;
  lastId: number;
  date: string;
  itemOrderError: boolean
  allOrderNo: any = []
  public model: any;
  showButton: boolean = true;
  quantityPending: any
  previousValue: number = 0;
  quantityPendingDefault: number = 0;

  constructor(private vendorService: VendorService, private invoiceService: InvoiceService, private itemService: ItemService, private router: Router, private fb: FormBuilder, private dialog: MatDialog, public snackBar: MatSnackBar, private purchaseOrderService: PurchaseOrderService) { }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 4000,

    });
  }
  async ngOnInit() {

    this.invoiceForm = this.fb.group({
      invoiceNo: new FormControl('', [Validators.required]),
      invoiceDate: new FormControl('', [Validators.required]),
      orderNo: new FormControl('', [Validators.required]),
      invoiceAmount: new FormControl('', [Validators.required]),
      invoiceDetails: this.fb.array([])
    })

    if(this.router.url.endsWith('/invoice/new')){
      this.heading = 'New Invoice';
    }
    else{
      this.heading = 'Edit Invoice';
    }
    let url = this.router.url
    if (!url.endsWith('/new') && !url.endsWith('/edit')) {
      this.getInvoiceDetail(url.split('/')[3])
    }
    if (url.endsWith('/edit')) {
      this.invoiceForm.controls['orderNo'].disable()
      this.invoiceForm.controls['invoiceAmount'].disable()
      this.invoiceForm.controls['invoiceDate'].disable()
    }
    this.date = new Date().toISOString().substr(0, 10);
    this.getAllOrderNo()

  }
  initiateForm(ids, quantity, quantityPending, quantityReceived): FormGroup {
    this.date = new Date().toISOString().substr(0, 10);
    return this.fb.group({
      itemNo: new FormControl(ids),
      description: new FormControl(),
      quantityOrdered: new FormControl(quantity),
      quantityPending: new FormControl(quantityPending),
      quantityReceived: new FormControl('0')
    })
  }

  createNewFormControl(ids, quantity, quantityPending, quantityReceived) {
    const control = <FormArray>this.invoiceForm.controls['invoiceDetails']
    control.push(this.initiateForm(ids, quantity, quantityPending, quantityReceived))
  }

  submitInvoice(submitStatus) {
    if(this.quantityReceivedGreater == true){
      this.openSnackBar('Quantity Received is greater than Quantity Pending!','Dismiss')
      return
    }
    else{
    if (!this.checkValidation()) {
      return
    }
    this.invoiceService.post(this.invoiceForm.value, submitStatus)
      .subscribe((res) => {
        let invoiceAction = 'Created'
        let nextPage = '/new'
        if (!this.router.url.endsWith('/invoice/new')) {
          invoiceAction = 'Updated'
          nextPage = '/edit'
        }
        this.openSnackBar(`Invoice ${invoiceAction}`, 'Dismiss')
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([`/invoice/${nextPage}`]);
        });
      })
    }
  }

  getAllOrderNo() {
    let value = {}
    value['allOrders'] = true
    this.purchaseOrderService.list(value)
      .subscribe((res: any) => {
        let itemOrders = res.data.map(value => value['id'])
        this.itemService.listOrder(itemOrders)
      })
  }

  async getInvoiceDetail(invoiceId) {
    this.invoiceService.getInvoice(invoiceId)
      .subscribe((res: any) => {
        {
          let arr = <FormArray>this.invoiceForm.controls.invoiceDetails
          arr.controls = []
          this.quantityPending = res.invoiceItems.map(items => items.quantityPending)
          let len = res.invoiceItems.length
          let date = new Date(Date.parse(res.invoiceDetails['invoiceDate'])).toISOString().substr(0, 10)
          this.invoiceForm.controls['invoiceDate'].setValue(date)
          this.invoiceForm.controls['invoiceNo'].setValue(res.invoiceDetails['invoiceNo'])
          this.invoiceForm.controls['orderNo'].setValue(res.invoiceDetails['orderNo'])
          this.invoiceForm.controls['invoiceAmount'].setValue(res.invoiceDetails['invoiceAmount'])
          let status: boolean = false
          if (res.invoiceStatus === 'receive') {
            status = true
            this.invoiceForm.controls['invoiceNo'].disable()
            this.invoiceForm.controls['orderNo'].disable()
            this.invoiceForm.controls['invoiceAmount'].disable()
            this.invoiceForm.controls['invoiceDate'].disable()
            this.showButton = false
          }
          else {
            this.invoiceForm.controls['invoiceDate'].enable()
            this.invoiceForm.controls['orderNo'].enable()
            this.invoiceForm.controls['invoiceAmount'].enable()
          }

          for (let i = 0; i < len; i++) {
            this.createNewFormControl(res.invoiceItems[i]['id'], res.invoiceItems[i]['quantity'], res.invoiceItems[i]['quantityPending'], res.invoiceItems[i]['quantityReceived'])
          }

          if (res.invoiceStatus === 'receive') {
            const control = <FormArray>this.invoiceForm.controls['invoiceDetails']
            control.controls.forEach(data => data.disable())
          }
        }

      }, error => {
        this.openSnackBar(error.error.msg, 'Dismiss')
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/invoice/edit']);
        });
      })

    if (!this.checkValidation()) {
      return;
    }
  }

  getInvoice() {
    if (!this.router.url.endsWith(`/new`)) {
      let invoiceNo = this.invoiceForm.controls['invoiceNo'].value
      this.getInvoiceDetail(invoiceNo)
    }
    else {
      return
    }
  }

  getItemOrderDetail(event) {
    if (event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90)) {
      return false
    }
    else {
      let orderID = this.invoiceForm.get('orderNo').value
      if (event.keyCode === 13 && orderID != '' && this.lastId != orderID) {
        this.lastId = this.invoiceForm.get('orderNo').value
        let arr = <FormArray>this.invoiceForm.controls.invoiceDetails
        arr.controls = []
        this.invoiceService.getParticularOrder(orderID)
          .subscribe((res: any) => {
            this.quantityPending = res.data.map(items => items.quantityPending)
            let len = res.data.length
            for (let i = 0; i < len; i++) {
              this.createNewFormControl(res.data[i]['itemIds'], res.data[i]['itemQuantity'], res.data[i]['quantityPending'], 0)
            }
          }, error => {
            this.openSnackBar(`${error.error.msg}`, 'Dismiss')
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/invoice/new']);
            });
          })
      }
    }
  }


  calculatePendingQuantity(index) {
    let controlArray = <FormArray>this.invoiceForm.get('invoiceDetails')
    let receivedQuantity = controlArray.value[index].quantityReceived
    let quantityOrdered = controlArray.value[index].quantityOrdered
    let url = this.router.url
    let leftQuantity
    if (!url.endsWith('/new')) {
      let initialPendingQuantity = this.quantityPending[index]
      leftQuantity = initialPendingQuantity - receivedQuantity
    }
    else {
      let initialPendingQuantity = this.quantityPending[index]
      leftQuantity = initialPendingQuantity - receivedQuantity
    }
    if(leftQuantity<0){
      this.openSnackBar('Quantity received cannot be more than quantity pending!','OK')
      this.quantityReceivedGreater = true;
    }
    else{
      this.quantityReceivedGreater = false;
    }
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

  itemDescription(id) {
    return this.itemService.items().find(item => item.id == id).description
  }
}