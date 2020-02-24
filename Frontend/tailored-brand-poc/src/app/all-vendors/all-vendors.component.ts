import { Component, OnInit } from '@angular/core';
import {SaveDataService} from '../service/save-data.service'
@Component({
  selector: 'app-all-vendors',
  templateUrl: './all-vendors.component.html',
  styleUrls: ['./all-vendors.component.css']
})
export class AllVendorsComponent implements OnInit {

  vendorData : []

  vendorIDS : any

  constructor(private saveData: SaveDataService) { }

  ngOnInit() {
    this.saveData.allVendors()
    .subscribe((res: any)=>{
      this.vendorData = res.data
      this.vendorIDS = Object.keys(res.data)
      console.log(this.vendorData)
    })
  }

}
