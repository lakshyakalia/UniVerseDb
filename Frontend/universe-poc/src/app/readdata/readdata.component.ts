import { Component, OnInit } from '@angular/core';
import { UniverseDataService } from '../service/universe-data.service';
import { FormGroup, FormControl } from '@angular/forms'
import { MatSnackBar}from '@angular/material/snack-bar'
@Component({
  selector: 'app-readdata',
  templateUrl: './readdata.component.html',
  styleUrls: ['./readdata.component.css']
})
export class ReaddataComponent implements OnInit {
  userDataStatus: boolean = false
  userData: any
  tableData:any
  columnData:any
  constructor(private dataService: UniverseDataService,private matsnackbar:MatSnackBar) {

  }
  $serialno = 0
  submitForm = new FormGroup({
    filename: new FormControl(),
    recordname: new FormControl(),
    usercmd: new FormControl()
  })

  get filename(){ return this.submitForm.get('filename') }

  //get recordname(){ return this.submitForm.get('recordname') }

  //get usercmd(){return this.submitForm.get('usercmd')}

  
  readData(submitForm) {
    console.log(submitForm)
      this.dataService.readData(submitForm.value)
        .subscribe((res: any) => {
          console.log(res)
          //this.userData = res.data;
          this.tableData=res.table
          this.columnData=res.column
          if(res.status=='404'){
            this.matsnackbar.open(res.msg,'Close',{
              duration:8000
            })
          }
        })
  }

  ngOnInit() {
  }

}
