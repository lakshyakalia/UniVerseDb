import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { MatSnackBar } from "@angular/material";
import { PurchaseOrderService } from '../service/purchase-order.service'
import { MatDialog } from '@angular/material/dialog'
import { PurchaseDialogBoxComponent } from './purchase-dialog-box.component'

@Component({
  selector: 'purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.css']
})
export class PurchaseOrderComponent implements OnInit {

  itemList: Array<any> = []

  itemOrderForm: FormGroup

  vendorNameList = []

  vendorItemIDList = []

  vendorObject = []

  editForm: boolean

  purchaseOrderTitle: string

  grandTotal: number = 0.00

  date: string

  itemOrderError : boolean

  lastId:number;

  showButtons : boolean = true

  states = ['California','Florida','Texas','Hawaii']

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    public snackBar: MatSnackBar
  ) { }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
       duration: 4000,
       
    });
 }

  purchaseOrderForm = new FormGroup({
    newOrder: new FormControl(''),
    orderDate: new FormControl('', Validators.required),
    vendorName: new FormControl('', Validators.required),
    companyName: new FormControl('', Validators.required),
    street: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    phoneNumber: new FormControl('', Validators.required),
    contactName: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    zipCode: new FormControl('', [Validators.required])
  })

  ngOnInit() {
    this.purchaseOrderService.getAllVendorName()
      .subscribe((res: any) => {
        let key = Object.keys(res.data)
        for (let i = 0; i < key.length; i++) {
          this.vendorNameList.push(res.data[key[i]][0][1])
        }
        this.vendorObject = res.data
        this.date = new Date().toISOString().substr(0, 10);
      })

    this.itemOrderForm = this.fb.group({
      vendorItem: new FormControl(''),
      specialRequests: this.fb.array([])
    })

    this.editForm = this.router.url.endsWith('/edit')
    if (!this.editForm) {
      this.purchaseOrderForm.controls['newOrder'].disable()
      this.purchaseOrderTitle = 'Create Purchase Order'
    }
    else {
      this.purchaseOrderTitle = 'Update Purchase Order'
    }
  }

  getVendorItems() {
    let vendorName = this.purchaseOrderForm.get('vendorName').value
    let key = Object.keys(this.vendorObject)
    for (let i = 0; i < key.length; i++) {
      if (this.vendorObject[key[i]][0][1] === vendorName) {
        this.vendorItemIDList = this.vendorObject[key[i]][1]
      }
    }
  }

  createNewFormControl(itemID, itemDescription, quantity, unitCost) {
    const control = <FormArray>this.itemOrderForm.controls['specialRequests']
    control.push(this.initiateForm(itemID, itemDescription, quantity, unitCost))
  }


  initiateForm(itemID, itemDescription, quantity, unitCost): FormGroup {
    return this.fb.group({
      itemID: [itemID],
      itemDescription: [itemDescription],
      quantity: new FormControl(quantity, Validators.required),
      unitCost: new FormControl(unitCost, Validators.required),
      totalPrice: [0]
    })
  }

  getItemOrderDetail(event) {
    let orderID = this.purchaseOrderForm.get('newOrder').value
    if (event.keyCode === 13 && this.editForm && orderID != '' && orderID !=this.lastId) {
      this.lastId=orderID
      this.purchaseOrderService.getParticularOrder(orderID)
        .subscribe((res: any) => {
          if (res.status === 404) {
            this.openSnackBar(`${orderID} does not exists`, 'Dismiss')
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/order/edit']);
          }); 
            
          }
          else {
            this.purchaseOrderTitle = "Update Purchase Order "+orderID
            this.setItemOrderDetails(res)
          }
        })
    }
  }

  setItemOrderDetails(res: any) {
    let submitBool = false
    for (let i in res.data) {
      this.purchaseOrderForm.controls[i].setValue(res.data[i])
      if (res.submitStatus === 'submit') {
        this.purchaseOrderForm.controls[i].disable()
      }
    }

    if (res.submitStatus === 'submit') {
      this.showButtons = false
      submitBool = true
    }

    for (let j in res.itemList) {
      let itemDescription :string
      let cost = res.itemList[j].cost
      let quantity = res.itemList[j].quantity
      let vendorItem = res.itemList[j].itemID
      this.purchaseOrderService.getParticularItemDetails(vendorItem)
        .subscribe((res: any) => {
          itemDescription = res.data
        })
      this.createNewFormControl(vendorItem, itemDescription, quantity, cost)
      this.calculateTotalPrice(j, submitBool)
    }
    this.getVendorItems()
  }

  addNewRow() {
    let vendorItem = this.itemOrderForm.get('vendorItem').value
    if (vendorItem != 'None') {
      this.itemOrderError = false
      this.purchaseOrderService.getParticularItemDetails(vendorItem)
        .subscribe((res: any) => {
          this.createNewFormControl(vendorItem, res.data, "", "")
        })
    }
  }

  removeParticularItem(index: number) {
    if(!this.editForm){
      let control = <FormArray>this.itemOrderForm.get('specialRequests')
      control.removeAt(index)
    }
  }

  calculateTotalPrice(index, submitBool) {
    let controlArray = <FormArray>this.itemOrderForm.get('specialRequests')
    let quantity = controlArray.value[index].quantity
    let unitCost = controlArray.value[index].unitCost
    this.grandTotal = 0
    if (quantity != "" || unitCost != "") {
      let totalPrice = quantity * unitCost
      controlArray.controls[index].get('totalPrice').setValue(totalPrice)
      if (submitBool) {
        controlArray.controls[index].get('quantity').disable()
        controlArray.controls[index].get('unitCost').disable()
      }
      controlArray.controls.forEach(control => {
        let price = parseInt(control.get('totalPrice').value)
        this.grandTotal += price
      })
    }

  }

  submitNewOrder(purchaseOrderForm, itemOrderForm, submitStatus) {
    let recordId
    if (this.editForm) {
      recordId = this.purchaseOrderForm.get('newOrder').value
    }
    else {
      recordId = Math.floor(Math.random() * 900000) + 100000
    }
    if (!this.checkValidation()) {
      return;
    }

    this.purchaseOrderService.submitNewOrder(purchaseOrderForm.value, itemOrderForm.value, recordId, submitStatus, this.editForm)
      .subscribe((res) => {
        let msg
        if (this.editForm) {
          msg = `Order ${recordId} updated`
          this.openSnackBar(`${msg}`, 'Dismiss')
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/order/edit']);
        });
        }
        else {
          msg = `Order ${recordId} Created`
          this.openSnackBar(`${msg}`, 'Dismiss')
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/order/new']);
        });
        } 
      })
  }

  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || (event.keyCode >=65 && event.keyCode <=90) ? false : true
  }

  checkValidation() {
    let status = true
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.get('companyName').markAsTouched()
      this.purchaseOrderForm.get('city').markAsTouched()
      this.purchaseOrderForm.get('zipCode').markAsTouched()
      this.purchaseOrderForm.get('phoneNumber').markAsTouched()
      this.purchaseOrderForm.get('contactName').markAsTouched()
      this.purchaseOrderForm.get('street').markAsTouched()
      this.purchaseOrderForm.get('vendorName').markAsTouched()
      this.purchaseOrderForm.get('state').markAsTouched()
      this.purchaseOrderForm.get('orderDate').markAsTouched()
      status = false
    }

    if(this.itemOrderForm.untouched) this.itemOrderError = true
    else this.itemOrderError = false

    if (this.itemOrderForm.invalid || !this.itemOrderForm.touched) {
      (<FormArray>this.itemOrderForm.get('specialRequests')).controls.forEach((group: FormGroup) => {
        (<any>Object).values(group.controls).forEach((control: FormControl) => {
          control.markAsTouched()
        })
      })
      status = false

    }
    return status
  }

  openDialogBox(msg){
    this.dialog.open(PurchaseDialogBoxComponent,{
      width: '450px',
      data:{ msg: msg}
    })
  }
}