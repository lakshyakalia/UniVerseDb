import { Component, OnInit } from '@angular/core';
import { SaveDataService } from '../service/vendor.service';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { generate } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-vendor-sign-up',
  templateUrl: './vendor-sign-up.component.html',
  styleUrls: ['./vendor-sign-up.component.css']
})
export class VendorSignUpComponent implements OnInit {
  items: FormGroup;
  constructor(private saveData: SaveDataService, private fb: FormBuilder, private router: Router) { }
  private recordData: any;
  private recordIds: any;
  private itemArray: Array<any> = [];
  sno: number = 1;
  recordId: Array<any> = [];
  toggle: boolean = false;
  editVendor: boolean;
  vendorId:number;
  heading:string='Register Vendor';
  vendorDetailForm = new FormGroup({
    vendorNo: new FormControl(),
    Company: new FormControl('', Validators.required),
    Street: new FormControl('', [Validators.required]),
    State: new FormControl('', [Validators.required]),
    Phone: new FormControl('', [Validators.required]),
    Contact: new FormControl('', [Validators.required]),
    City: new FormControl('', [Validators.required]),
    Zip: new FormControl('', [Validators.required])

  })
  deleteRow(index) {
    console.log(index)
    const control = <FormArray>this.items.get('items');
    control.removeAt(index)
    this.itemArray.splice(index, 1);
  }
  setVendorId(event){
    if(event.keyCode===13){
      this.vendorId=this.vendorDetailForm.get('vendorNo').value
      console.log(this.vendorId)
      this.saveData.particularVendor(this.vendorId)
        .subscribe((res: any) => {
          if(res.status === 404){
            alert(res.msg)
          }
          else{
            this.setItemdOrderDetails(res)
          }
          
        })
    }
  }
  ngOnInit() {
    this.saveData.readItem()
      .subscribe((res: any) => {
        this.recordData = res.table;
        this.recordIds = Object.keys(res.table)
      })

    this.items = this.fb.group({
      itemId: new FormControl('', [Validators.required]),
      items: this.fb.array([])
    });
    this.editVendor = this.router.url.endsWith('/vendor/edit')
    console.log(this.editVendor)
    if (this.editVendor) {
      console.log("---")
      this.heading='Edit Vendor';
    }
    else{
      this.vendorDetailForm.controls['vendorNo'].disable()
    }
    console.log(this.items.controls)
  }
  initiateForm(description, id): FormGroup {
    return this.fb.group({
      items: new FormControl(id),
      description: new FormControl(description)
    });
  }
  setItemdOrderDetails(res: any) {
    for (let i in res.data) {
      this.vendorDetailForm.controls[i].setValue(res.data[i])
    }
    for (let j in res.itemIds){
      let id =res.itemIds[j].itemId
      let desc=this.recordData[id][0]
      this.createFormControl(id,desc)
      console.log(id)
      
    }

  }
  createFormControl(id,desc){
    const control =<FormArray> this.items.controls['items']
    control.push(this.initiateForm(desc,id))  
  }
  addRecordId() {
    let id = this.items.get('itemId').value
    let description = this.recordData[id][0]

    let controlArray = this.items.get('items').value
    let status = controlArray.find(element => element.items === id)
    if (status === undefined) {
      let control = <FormArray>this.items.controls['items']
      control.push(this.initiateForm(description, id))
    }
  }
  vendorDetail(vendorDetail, items) {
    this.toggle = true;
    if (this.vendorDetailForm.valid) {
      if(!this.editVendor){
        let vendorId = Math.floor(Math.random() * 900000) + 100000
      this.saveData.vendorDetail(vendorDetail.value, items.value, vendorId)
        .subscribe((res: any) => {
          
          if (res.message == "data saved") {
            alert("Vendor Number Created- " + vendorId);
            window.location.reload();

          }
          else {
            alert("error")
          }
        
        })
      }
      else{
        this.saveData.vendorUpdate(vendorDetail.value,items.value,this.vendorId)
        .subscribe((res:any)=>{
          if(res.message=="data saved")
          {
            alert("user updated");
            window.location.reload();
          }
        })
      }
    }
  }
  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || (event.keyCode >=65 && event.keyCode <=90)  ? false : true
  }
  checkForAlphabets(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || ( event.keyCode >= 49 && event.keyCode <=57 ) ? false : true
  }
  checkForPhone(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || (event.keyCode >=65 && event.keyCode <=90)  ? false : true
  }
}
