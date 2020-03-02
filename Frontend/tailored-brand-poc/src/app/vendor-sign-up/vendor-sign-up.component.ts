import { Component, OnInit } from '@angular/core';
import { VendorService } from '../service/vendor.service';
import { SaveDataService } from '../service/vendor.service';
import { StatesService } from '../service/states.service';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import {  Observable } from 'rxjs';
import {  debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PurchaseDialogBoxComponent } from '../purchase-order/purchase-dialog-box.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from "@angular/material";

@Component({
  selector: 'app-vendor-sign-up',
  templateUrl: './vendor-sign-up.component.html',
  styleUrls: ['./vendor-sign-up.component.css']
})
export class VendorSignUpComponent implements OnInit {
  items: FormGroup;
  constructor(private saveData: VendorService, private fb: FormBuilder, private router: Router, private dialog : MatDialog , public snackBar: MatSnackBar ) { }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
       duration: 4000,
       
    });
 }
  stateList: string[];
  selectedState: string = "";
  constructor(private saveData: SaveDataService, private states: StatesService, private fb: FormBuilder, private router: Router, private dialog : MatDialog) {
    this.stateList = states.all();
  }
  private recordData: any;
  private itemList: any;
  private itemArray: Array<any> = [];
  itemError : boolean
  lastid:number;
  vendorNumberHeader : number;
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
  selectedItem: string = "";

  deleteRow(index) {
    const control = <FormArray>this.items.get('items');
    control.removeAt(index)
    this.itemArray.splice(index, 1);
  }
  setVendorId(event){
    if(event.keyCode===13 && this.lastid!=this.vendorDetailForm.get('vendorNo').value){
      this.vendorId=this.vendorDetailForm.get('vendorNo').value
      this.lastid=this.vendorId
      console.log(this.vendorId)
      this.saveData.particularVendor(this.vendorId)
        .subscribe((res: any) => {
          if(res.status === 404){
            this.openSnackBar(`${res.msg} `, 'Dismiss')
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/vendor/edit']);
          }); 
          }
            
          else{
            this.heading=`Edit Vendor ${this.vendorId}`;
            this.setItemdOrderDetails(res)
          }
          
        })
    }
    this.vendorId=this.vendorDetailForm.get('vendorNo').value
    this.saveData.particularVendor(this.vendorId)
      .subscribe((res: any) => {
        if(res.status === 404){
          this.openDialogBox(res.msg)
        }
        else{
          this.heading=`Edit Vendor ${this.vendorId}`;
          this.setItemdOrderDetails(res)
        }
        
      })
  }
  ngOnInit() {
    this.saveData.readItem()
      .subscribe((res: any) => {
        this.recordData = res.table;
        let keyPipeValues = []
        let keys = Object.keys(this.recordData)
        for(let i = 0; i < keys.length; i++)
        {
          keyPipeValues.push(`${keys[i]} | ${this.recordData[keys[i]]}`)
        }
        this.itemList = keyPipeValues
      })

    this.items = this.fb.group({
      itemId: new FormControl('', [Validators.required]),
      items: this.fb.array([],[Validators.required])
    });
    this.editVendor = this.router.url.endsWith('/vendor/edit')
    if (this.editVendor) {
      this.heading='Edit Vendor';
    }
    else{
      this.vendorDetailForm.controls['vendorNo'].disable()
    }
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
    this.selectedState = res.data["State"]
    for (let j in res.itemIds){
      let id =res.itemIds[j].itemId
      let desc=this.recordData[id][0]
      this.createFormControl(id,desc)
    }

  }
  createFormControl(id,desc){
    const control =<FormArray> this.items.controls['items']
    control.push(this.initiateForm(desc,id))  
  }
  itemTypeahead = (text$: Observable<string>) => 
  text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(keyword => keyword.length < 2 ? []
      : this.itemList.filter(v => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1).slice(0, 10))
  )
  selectItem(event) {
    let id = event.item.split("|")[0].trim()
    let description = this.recordData[id][0]

    let controlArray = this.items.get('items').value
    let status = controlArray.find(element => element.items === id)
    if (status === undefined) {
      this.itemError = false
      let control = <FormArray>this.items.controls['items']
      control.push(this.initiateForm(description, id))
    }
    // Workaround to clear the typeahead box after user makes a selection
    if(this.selectedItem == "")
      this.selectedItem = null
    else
      this.selectedItem = ""    
  }
  stateTypeahead = (text$: Observable<string>) => 
  text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(keyword => keyword.length < 2 ? []
      : this.stateList.filter(v => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1).slice(0, 10))
  )
  selectState(event) {
    this.selectedState = event.item.split("|")[0].trim();
    this.vendorDetailForm.controls['State'].setValue(this.selectedState);
  }
  vendorDetail(vendorDetail, items) {
    this.toggle = true;

    if(this.items.controls.items["length"] == 0){
      this.itemError = true
      return
    }
    if (this.vendorDetailForm.valid) {
      if(!this.editVendor){
        let vendorId = Math.floor(Math.random() * 900000) + 100000
      this.saveData.vendorDetail(vendorDetail.value, items.value, vendorId)
        .subscribe((res: any) => {
          
          if (res.status == 200) {
            this.openSnackBar(`Vendor ${vendorId} Created! `, 'Dismiss')
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/vendor/new']);
          }); 

          }
          else {
            this.openSnackBar(`Error! `, 'Dismiss')
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/vendor/new']);
          }); 
          }
        
        })
      }
      else{
        this.saveData.vendorUpdate(vendorDetail.value,items.value,this.vendorId)
        .subscribe((res:any)=>{
          if(res.status==200)
          {
            this.openSnackBar(`Vendor Updated ! `, 'Dismiss')
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/vendor/edit']);
          }); 
          }
        })
      }
    }
  }
  checkForExponential(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || (event.keyCode >=65 && event.keyCode <=90)  ? false : true
  }
  checkForAlphabets(event) {
    return  event.keyCode == 190 || event.keyCode == 107 || ( event.keyCode >= 49 && event.keyCode <=57 ) ? false : true

  }
  checkForPhone(event) {
    return event.keyCode == 69 || event.keyCode == 190 || event.keyCode == 107 || (event.keyCode >=65 && event.keyCode <=90)  ? false : true
  }
    
  openDialogBox(msg){
    this.dialog.open(PurchaseDialogBoxComponent,{
      width: '420px',
      data:{msg: msg}
    })
  }
}
