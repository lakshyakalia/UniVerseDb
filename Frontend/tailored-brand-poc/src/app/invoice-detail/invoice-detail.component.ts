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
  invoiceForm: FormGroup;
  editInvoice: boolean;
  heading: string = 'New Invoice';
  lastId: number;
  date: string;
  itemOrderError: boolean
  allOrderNo: any = []
  public model: any;
  showButton : boolean = true;
  quantityReceived : any
  previousValue : number = 0;
  quantityPendingDefault : number = 0;

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

    this.editInvoice = this.router.url.endsWith('/invoice/edit')

    if (this.editInvoice) {
      this.heading = 'Edit Invoice';
    }
    let url = this.router.url
    if (!url.endsWith('/new') && !url.endsWith('/edit')) {
      this.getInvoiceDetail(url.split('/')[3])
    }
    if (url.endsWith('/edit')){
      this.invoiceForm.controls['orderNo'].disable()
      this.invoiceForm.controls['invoiceAmount'].disable()
      this.invoiceForm.controls['invoiceDate'].disable()
    }
    this.date = new Date().toISOString().substr(0, 10);
    this.getAllOrderNo()

  }
  initiateForm(ids, quantity,quantityPending): FormGroup {
    this.date = new Date().toISOString().substr(0, 10);
    return this.fb.group({
      itemNo: new FormControl(ids),
      description: new FormControl(),
      quantityOrdered: new FormControl(quantity),
      quantityPending: new FormControl(quantityPending),
      quantityReceived: new FormControl()
    })
  }

  createNewFormControl(ids, quantity,quantityReceived) {
    const control = <FormArray>this.invoiceForm.controls['invoiceDetails']
    control.push(this.initiateForm(ids, quantity,quantityReceived))
  }

  submitInvoice(submitStatus) {
    if(!this.checkValidation()){
      return
    }
    this.invoiceService.post(this.invoiceForm.value, submitStatus)
      .subscribe((res) => {
        let invoiceAction = 'Created'
        let nextPage = '/new'
        if(!this.router.url.endsWith('/invoice/new')){
          invoiceAction = 'Updated'
          nextPage = '/edit'
        }
        this.openSnackBar(`Invoice ${invoiceAction}`, 'Dismiss')
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([`/invoice/${nextPage}`]);
        });
      })
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
        let  arr = <FormArray>this.invoiceForm.controls.invoiceDetails
        arr.controls = []
        this.quantityReceived = res.quantityReceived
        let len = res.ids.length
        let date = new Date(Date.parse(res.invoiceDate[0])).toISOString().substr(0, 10)
        this.invoiceForm.controls['invoiceDate'].setValue(date)
        this.invoiceForm.controls['invoiceNo'].setValue(res.invoiceNo[0])
        this.invoiceForm.controls['orderNo'].setValue(res.orderNo[0])
        this.invoiceForm.controls['invoiceAmount'].setValue(res.invoiceAmount[0])
        let status : boolean = false
        if(res.invoiceStatus[0] === 'receive'){
          status = true
          this.invoiceForm.controls['invoiceNo'].disable()
          this.showButton = false
        }
        else{
          this.invoiceForm.controls['invoiceDate'].enable()
          this.invoiceForm.controls['orderNo'].enable()
          this.invoiceForm.controls['invoiceAmount'].enable() 
        }

        for (let i = 0; i < len; i++) {
          this.createNewFormControl(res.ids[i], res.quantity[i],res.quantityReceived[i])
        }
        
        if(res.invoiceStatus[0] === 'receive'){
          const control = <FormArray>this.invoiceForm.controls['invoiceDetails']
          control.controls.forEach(data => data.disable())
        }
      })

    if (!this.checkValidation()) {
      return;
    }
  }

  getInvoice(){
    if(!this.router.url.endsWith(`/new`)){
    let invoiceNo = this.invoiceForm.controls['invoiceNo'].value
    this.getInvoiceDetail(invoiceNo)
    }
    else{
      return
    }
  }

  getItemOrderDetail(event) {
    if (event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || event.keyCode == 189 || (event.keyCode >= 65 && event.keyCode <= 90))
    {
      return false
    }
    else {
      let orderID = this.invoiceForm.get('orderNo').value
      if (event.keyCode === 13 && orderID != '' && this.lastId != orderID) {
        this.lastId = this.invoiceForm.get('orderNo').value
        let  arr = <FormArray>this.invoiceForm.controls.invoiceDetails
        arr.controls = []
        this.invoiceService.getParticularOrder(orderID)
          .subscribe((res: any) => {
            if (res.status == 200) {
              let len = res.ids.length
              for (let i = 0; i < len; i++) {
                this.createNewFormControl(res.ids[i], res.quantity[i],this.quantityPendingDefault)
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


  calculatePendingQuantity(index) {
    let controlArray = <FormArray>this.invoiceForm.get('invoiceDetails')
    let receivedQuantity = controlArray.value[index].quantityReceived
    let quantityOrdered = controlArray.value[index].quantityOrdered
    let url = this.router.url
    let leftQuantity
    if (!url.endsWith('/new')) {
      let initialPendingQuantity = this.quantityReceived[index]
      leftQuantity =  initialPendingQuantity - receivedQuantity
    }
    else{
      leftQuantity = quantityOrdered - receivedQuantity
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