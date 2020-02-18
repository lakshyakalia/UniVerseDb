import { Component, OnInit } from '@angular/core';
import {SaveDataService} from '../service/save-data.service';
@Component({
  selector: 'app-vendor-sign-up',
  templateUrl: './vendor-sign-up.component.html',
  styleUrls: ['./vendor-sign-up.component.css']
})
export class VendorSignUpComponent implements OnInit {

  constructor(private saveData:SaveDataService) { }
  private recordData:any;
  private recordIds:any;
  private itemArray:Array<any>=[];
  private fieldArray:any={};
  sno:number=1;
  recordId:Array<any>=[];
  addRow(){
    this.itemArray.push(this.fieldArray);
    this.fieldArray={};
    this.sno=this.sno+1;
  }
deleteRow(index){
  console.log(index)
  this.itemArray.splice(index,1);
}
  ngOnInit() {
    this.saveData.readItem()
    .subscribe((res:any)=>{
      this.recordData=res.table;
      this.recordIds = Object.keys(res.table)
      // this.recordId = this.recordIds[0]
    })
    
  }
  addRecordId(id){  
    console.log(id)
    // if(this.recordId.find(element => element === id))
    // {
    //  console.log("Already exist")
    //  alert("______")
    // }
    // else{    
    this.recordId.push(id);
    console.log(this.recordId)
    }
    
//  }

}
