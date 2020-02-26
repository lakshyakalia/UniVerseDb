import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms'
import { Router } from '@angular/router'

import { PurchaseOrderService } from '../service/purchase-order.service'

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

  vendorObject = []

  editForm : boolean

  purchaseOrderTitle : string

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private fb: FormBuilder,
    private router: Router
  ) { }

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
      let key = Object.keys(res.data)
      for(let i=0;i<key.length;i++){
        this.vendorNameList.push(res.data[key[i]][0][1])
      }
      this.vendorObject = res.data
    })

    this.itemOrderForm = this.fb.group({
      vendorItem: new FormControl(''),
      specialRequests: this.fb.array([])
    })

    this.editForm = this.router.url.endsWith('/edit')
    if(!this.editForm){
      this.purchaseOrderForm.controls['newOrder'].disable()
      this.purchaseOrderTitle = 'Create Purchase Order'
    }
    else{
      this.purchaseOrderTitle = 'Update Purchase Order'
    }
  }

  getVendorItems(){
    let vendorName = this.purchaseOrderForm.get('vendorName').value
    let key = Object.keys(this.vendorObject)
    for(let i=0;i<key.length;i++){
      if(this.vendorObject[key[i]][0][1] === vendorName){
        this.vendorItemIDList = this.vendorObject[key[i]][1]
      }
    }
  }

  createNewFormControl(itemID, itemDescription,quantity,unitCost){
    const control = <FormArray>this.itemOrderForm.controls['specialRequests']
    control.push(this.initiateForm(itemID,itemDescription,quantity,unitCost))
  }


  initiateForm(itemID,itemDescription,quantity,unitCost) : FormGroup{
    return this.fb.group({
      itemID: [itemID],
      itemDescription: [itemDescription],
      quantity: new FormControl(quantity),
      unitCost: new FormControl(unitCost),
      totalPrice : [0]
   })
  }

  getItemOrderDetail(event){
    let orderID = this.purchaseOrderForm.get('newOrder').value
    if(event.keyCode === 13 && this.editForm && orderID != ''){
      this.purchaseOrderService.getParticularOrder(orderID)
      .subscribe((res:any)=>{
        if(res.status  === 404){
          alert(res.msg)
        }
        else{
          this.setItemOrderDetails(res)
        }
      })
    }
  }

  setItemOrderDetails(res:any){
    let submitBool = false
    for(let i in res.data){
      this.purchaseOrderForm.controls[i].setValue(res.data[i])
      if(res.submitStatus === 'submit'){
        this.purchaseOrderForm.controls[i].disable()
      } 
    }

    if(res.submitStatus === 'submit'){
      submitBool = true
    }

    for(let j in res.itemList){
      let cost = res.itemList[j].cost
      let quantity = res.itemList[j].quantity
      let vendorItem = res.itemList[j].itemID
      this.purchaseOrderService.getParticularItemDetails(vendorItem)
      .subscribe((res:any)=>{
        this.createNewFormControl(vendorItem,res.data,quantity,cost)
        this.calculateTotalPrice(j,submitBool)
      })
    }
  }

  addNewRow(){
    let vendorItem = this.itemOrderForm.get('vendorItem').value
    let controlArray = this.itemOrderForm.get('specialRequests').value
    let status = controlArray.find(element => element.itemID === vendorItem)

    if(vendorItem != 'None' && status == undefined){
      this.purchaseOrderService.getParticularItemDetails(vendorItem)
      .subscribe((res:any)=>{
        this.createNewFormControl(vendorItem,res.data,"","")
      })
    }
  }

  removeParticularItem(index: number){
    let control = <FormArray>this.itemOrderForm.get('specialRequests')
    control.removeAt(index)
  }

  calculateTotalPrice(index,submitBool){
    let controlArray = <FormArray>this.itemOrderForm.get('specialRequests')
    let quantity = controlArray.value[index].quantity
    let unitCost = controlArray.value[index].unitCost
    if(quantity != "" || unitCost != ""){
      let totalPrice = quantity * unitCost
      controlArray.controls[index].get('totalPrice').setValue(totalPrice)
      if(submitBool){
        controlArray.controls[index].get('quantity').disable()
        controlArray.controls[index].get('unitCost').disable()
      }
    }
  }

  submitNewOrder(purchaseOrderForm,itemOrderForm,submitStatus){
    let recordId
    if(this.editForm){
      recordId = this.purchaseOrderForm.get('newOrder').value
    }
    else{
      recordId = Math.floor(Math.random()*900000) + 100000
    }
    this.purchaseOrderService.submitNewOrder(purchaseOrderForm.value,itemOrderForm.value,recordId,submitStatus,this.editForm)
    .subscribe((res)=>{
      if(this.editForm){
        alert('Existing order updated')
      }
      else{
        alert(`New Order No - ${recordId} Created`)
      }
      window.location.reload()
    })
  }
}
