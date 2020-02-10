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
  userdataStatus: boolean = false
  userdata: any
  constructor(private dataService: UniverseDataService,private matsnackbar:MatSnackBar) {

  }
  
  $serialno = 0
  submitForm = new FormGroup({
    filename: new FormControl(),
    recordname: new FormControl()
  })

  get filename(){ return this.submitForm.get('filename') }

  get recordname(){ return this.submitForm.get('recordname') }
  
  readData(submitForm) {
      this.dataService.readData(submitForm.value)
        .subscribe((res: any) => {
          this.userdata = res.data;
          console.log(res)
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
