import { Component, OnInit } from '@angular/core';
import {VendorService} from '../service/vendor.service'
import { PurchaseDialogBoxComponent } from '../purchase-order/purchase-dialog-box.component'
import { MatDialog } from '@angular/material/dialog'

@Component({
  selector: 'app-all-vendors',
  templateUrl: './all-vendors.component.html',
  styleUrls: ['./all-vendors.component.css']
})
export class AllVendorsComponent implements OnInit {

  vendorData : []

  vendorIDS : any

  constructor(private saveData: VendorService , private dialog : MatDialog) { }

  ngOnInit() {
    this.saveData.allVendors()
    .subscribe((res: any)=>{
      this.vendorData = res.data
      this.vendorIDS = Object.keys(res.data)
      console.log(this.vendorData)
    })
  }
  openDialogBox(msg){
    this.dialog.open(PurchaseDialogBoxComponent,{
      width: '250px',
      data:{ msg: msg}
    })
  }
}
