import { Component, OnInit } from '@angular/core';
import { VendorService } from '../service/vendor.service';
import { StateService } from '../service/state.service';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseDialogBoxComponent } from '../purchase-order/purchase-dialog-box.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from "@angular/material";
import { ItemService } from '../service/item.service';

@Component({
  selector: 'app-vendor-sign-up',
  templateUrl: './vendor-sign-up.component.html',
  styleUrls: ['./vendor-sign-up.component.css']
})
export class VendorSignUpComponent implements OnInit {
  items: FormGroup;
  constructor(private vendorService: VendorService, private stateService: StateService, private itemService: ItemService, private fb: FormBuilder,
    private router: Router, private route: ActivatedRoute, private dialog : MatDialog , public snackBar: MatSnackBar ) {
    let id = this.route.snapshot.paramMap.get('id');
    if(id)
    {
      this.vendorDetailForm.get('VendorNo').setValue(id)
      this.fillVendorDetails()
    }
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
       duration: 4000,       
    });
 }
  selectedState: string = "";
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
    VendorNo: new FormControl(),
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
  fillVendorDetails(){
    let currentVendorId = this.vendorDetailForm.get('VendorNo').value || ""
    if(this.lastid!=currentVendorId && currentVendorId.trim().length > 0){
      this.vendorId=this.vendorDetailForm.get('VendorNo').value
      this.lastid=this.vendorId
      this.vendorService.get(this.vendorId)
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
  }
  ngOnInit() {
    this.items = this.fb.group({
      itemId: new FormControl('', [Validators.required]),
      items: this.fb.array([],[Validators.required])
    });
    this.editVendor = this.router.url.includes('/vendor/edit')
    if (this.editVendor) {
      this.heading='Edit Vendor';
    }
    else{
      this.vendorDetailForm.controls['VendorNo'].disable()
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
      let desc=this.itemService.listRaw()[id][0]
      this.createFormControl(id,desc)
    }

  }
  createFormControl(id,desc){
    const control =<FormArray> this.items.controls['items']
    control.push(this.initiateForm(desc,id))  
  }
  selectItem(event) {
    let id = event.item.split("|")[0].trim()
    let description = this.itemService.listRaw()[id][0]

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
      this.vendorService.post(vendorDetail.value, items.value, vendorId)
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
        this.vendorService.put(vendorDetail.value,items.value,this.vendorId)
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
