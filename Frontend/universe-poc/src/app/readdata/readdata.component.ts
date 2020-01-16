import { Component, OnInit } from '@angular/core';
import { UniverseDataService } from '../service/universe-data.service';
import { FormGroup, FormControl } from '@angular/forms'

@Component({
  selector: 'app-readdata',
  templateUrl: './readdata.component.html',
  styleUrls: ['./readdata.component.css']
})
export class ReaddataComponent implements OnInit {
  userdataStatus: boolean = false
  userdata: any
  constructor(private dataService: UniverseDataService) {

  }
  buttonText = 'Show data'
  $serialno = 0
  submitForm = new FormGroup({
    filename: new FormControl(),
    recordname: new FormControl()
  })

  get filename(){ return this.submitForm.get('filename') }

  get recordname(){ return this.submitForm.get('recordname') }
  
  readData(submitForm) {
    if (this.userdataStatus) {
      this.userdata = null
      this.userdataStatus = false
      this.buttonText = 'Show data'
    }
    else {
      this.dataService.readData(submitForm.value)
        .subscribe((res: any) => {
          this.userdata = res.data;
          this.userdataStatus = true
          this.buttonText = 'Hide data'
        })
    }
  }

  ngOnInit() {
  }

}
