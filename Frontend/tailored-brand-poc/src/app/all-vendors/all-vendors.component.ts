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

  constructor(private vendorService: VendorService , private dialog : MatDialog) { }

  ngOnInit() {}

  openDialogBox(msg){
    this.dialog.open(PurchaseDialogBoxComponent,{
      width: '250px',
      data:{ msg: msg}
    })
  }

  downloadFile() {
      let csvData = this.convertToCSV(this.vendorService.vendors, ['S.No','Vendor No', 'Vendor Company', 'Name', 'Phone']);
      let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
      let dwldLink = document.createElement("a");
      let url = URL.createObjectURL(blob);
      let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
      if (isSafariBrowser) {
          dwldLink.setAttribute("target", "_blank");
      }
      dwldLink.setAttribute("href", url);
      dwldLink.setAttribute("download", "all-vendors.csv");
      dwldLink.style.visibility = "hidden";
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
  }

  convertToCSV(vendors, headerList) {
      let str = '';
      let row = '';

      for (let index in headerList) {
          row += headerList[index] + ',';
      }
      row = row.slice(0, -1);
      str += row + '\r\n';
      
      for(let i = 0; i < vendors.length; i++)
      {
        let line = `${i+1}, ${vendors[i].id}, "${vendors[i].company}", "${vendors[i].name}", ${vendors[i].phone}`;
        str += line + '\r\n';
      }
      return str;
  }
}
