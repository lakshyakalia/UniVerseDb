import { Component } from '@angular/core'
import { UniverseDataService } from './service/universe-data.service'
import { FormGroup, FormControl } from '@angular/forms'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  userdataStatus: boolean = false
  
  userdata : any

  $serialno = 0

  buttonText  = 'Show data'

  constructor(private dataService: UniverseDataService) {

  }

  submitForm  = new FormGroup({
    filename : new FormControl(),
    recordname : new FormControl()
  })

  get filename(){ return this.submitForm.get('filename') }

  get recordname(){ return this.submitForm.get('recordname') }

  submitData(submitForm) { 
    this.dataService.submitData(submitForm.value)
    .subscribe(res=>{
      console.log(res)
    })
  }

  readData(value) {
    if(this.userdataStatus){
      this.userdata = null
      this.userdataStatus = false
      this.buttonText = 'Show data'
    }
    else{
      this.dataService.readData(value)
      .subscribe((res:any) => {
        this.userdata = res.data;
        this.userdataStatus = true
        this.buttonText = 'Hide data'
      })
    }
  }
}
