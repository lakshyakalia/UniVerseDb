import { Component, OnInit } from '@angular/core';

import { PurchaseOrderService } from '../service/purchase-order.service'
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
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
    // const control1 = <FormArray>this.itemOrderForm.get('specialRequests')
    
    control.push(this.initiateForm(itemID,itemDescription))
  }

  initiateForm(itemID, itemDescription) : FormGroup{
    return this.fb.group({
      itemID: [itemID],
      itemDescription: [itemDescription],
      quantity: new FormControl(""),
      unitCost: new FormControl("")
   })
  }

  addNewRow(){
    let vendorItem = this.itemOrderForm.get('vendorItem').value
    if(vendorItem != 'None'){
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

  calculateTotalPrice(quantity){
    console.log('calculate')
    console.log(this.itemOrderForm.value)
  }
}

export class itemObject{
  public quantity: number
  public unitCost : number
}