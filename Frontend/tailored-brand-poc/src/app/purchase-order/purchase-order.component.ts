import { Component, OnInit } from '@angular/core';

import { PurchaseOrderService } from '../service/purchase-order.service'
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms'

@Component({
  selector: 'purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.css']
})
export class PurchaseOrderComponent implements OnInit {

  itemList : Array <any> = []

  itemOrderForm : FormGroup

  vendorNameList = []

  vendorItemIDList = []

  constructor(private purchaseOrderService: PurchaseOrderService, private fb : FormBuilder) { }

  purchaseOrderForm = new FormGroup({
    newOrder :  new FormControl(''),
    orderDate : new FormControl(''),
    vendorName : new FormControl(''),
    companyName : new FormControl(''),
    street : new FormControl(''),
    state : new FormControl(''),
    phoneNumber : new FormControl(''),
    contactName : new FormControl(''),
    city : new FormControl(''),
    zipCode : new FormControl('')
  })

  ngOnInit() {
    this.purchaseOrderService.getAllVendorName()
    .subscribe((res: any)=>{
      this.vendorNameList = res.vendorName
    })

    this.itemOrderForm = this.fb.group({
      vendorItem: new FormControl(''),
      specialRequests: this.fb.array([])
    });
    console.log(this.itemOrderForm.get('specialRequests'))
  }

  getVendorItems(){
    let vendorName = this.purchaseOrderForm.get('vendorName').value
    this.purchaseOrderService.getParticularVendorItems(vendorName)
    .subscribe((res:any)=>{
      this.vendorItemIDList = res.itemList
    })
  }

  createNewFormControl(itemID, itemDescription){
    const control = <FormArray>this.itemOrderForm.controls['specialRequests']
    control.push(this.initiateForm(itemID,itemDescription))
  }

  initiateForm(itemID, itemDescription) : FormGroup{
    return this.fb.group({
      itemID: [itemID],
      itemDescription: [itemDescription],
      quantity: new FormControl(""),
      unitCost: new FormControl(""),
      totalPrice : [0]
   })
  }

  addNewRow(){
    let vendorItem = this.itemOrderForm.get('vendorItem').value
    let controlArray = this.itemOrderForm.get('specialRequests').value
    let status = controlArray.find(element => element.itemID === vendorItem)

    if(vendorItem != 'None' && status == undefined){
      this.purchaseOrderService.getParticularItemDetails(vendorItem)
      .subscribe((res:any)=>{
        this.createNewFormControl(vendorItem,res.data)
      })
    }
  }

  removeParticularItem(index: number){
    let control = <FormArray>this.itemOrderForm.get('specialRequests')
    control.removeAt(index)
  }

  calculateTotalPrice(index){
    let controlArray = <FormArray>this.itemOrderForm.get('specialRequests')
    let totalPrice = controlArray.value[index].quantity * controlArray.value[index].unitCost
    controlArray.controls[index].get('totalPrice').setValue(totalPrice)
  }

  submitNewOrder(purchaseOrderForm,itemOrderForm){
    let recordId = Math.floor(Math.random()*900000) + 100000
    this.purchaseOrderService.submitNewOrder(purchaseOrderForm.value,itemOrderForm.value,recordId)
    .subscribe((res)=>{
      console.log(res)
    })
  }
}