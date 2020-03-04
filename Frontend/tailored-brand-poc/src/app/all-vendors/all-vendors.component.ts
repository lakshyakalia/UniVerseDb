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

  vendors : any[]

  vendorIDS : any

  constructor(private vendorService: VendorService , private dialog : MatDialog) { }

  ngOnInit() {
    this.vendors = this.vendorService.listRaw()
  }
  openDialogBox(msg){
    this.dialog.open(PurchaseDialogBoxComponent,{
      width: '250px',
      data:{ msg: msg}
    })
  }
}
