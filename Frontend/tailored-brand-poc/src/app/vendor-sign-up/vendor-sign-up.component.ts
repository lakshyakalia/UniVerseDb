import { Component, OnInit } from '@angular/core';
import { SaveDataService } from '../service/save-data.service';
import { FormGroup, FormBuilder, FormArray, FormControl,Validators } from '@angular/forms';
import { generate } from 'rxjs';
@Component({
  selector: 'app-vendor-sign-up',
  templateUrl: './vendor-sign-up.component.html',
  styleUrls: ['./vendor-sign-up.component.css']
})
export class VendorSignUpComponent implements OnInit {
  items: FormGroup;
  constructor(private saveData: SaveDataService, private fb: FormBuilder) { }
  private recordData: any;
  private recordIds: any;
  private itemArray: Array<any> = [];
  sno: number = 1;
  recordId: Array<any> = [];
  toggle:boolean=false;
  vendorDetailForm = new FormGroup({
    Company: new FormControl('',Validators.required),
    Street: new FormControl('',[Validators.required]),
    State: new FormControl('',[Validators.required]),
    Phone: new FormControl('',[Validators.required]),
    Contact: new FormControl('',[Validators.required]),
    City: new FormControl('',[Validators.required]),
    Zip: new FormControl('',[Validators.required])

  })
  deleteRow(index) {
    console.log(index)
    const control = <FormArray>this.items.get('users');
    control.removeAt(index)
    this.itemArray.splice(index, 1);
  }
  ngOnInit() {
    this.saveData.readItem()
      .subscribe((res: any) => {
        this.recordData = res.table;
        this.recordIds = Object.keys(res.table)
      })
    this.items = this.fb.group({
      itemId: new FormControl('',[Validators.required]),
      items: this.fb.array([])
    });
    console.log(this.items.controls)
  }
  initiateForm(description, id): FormGroup {
    return this.fb.group({
      items: new FormControl(id),
      description: new FormControl(description)
    });
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
    this.toggle=true;
    if(this.vendorDetailForm.valid){

    let vendorId = Math.floor(Math.random()*900000) + 100000

    this.saveData.vendorDetail(vendorDetail.value, items.value,vendorId)
    .subscribe((res:any)=>{
      console.log(res)
      if(res.message=="data saved"){
        alert("Vendor Number Created- "+vendorId);
        window.location.reload();
        
      }
      else{
        alert("error")
     }
   })
  
  }
  }
}
