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

  uploadedFiles : Array <File>

  constructor(private dataService: UniverseDataService) {

  }

  submitForm  = new FormGroup({
    filename : new FormControl(),
    recordname : new FormControl()
  })

  get filename(){ return this.submitForm.get('filename') }

  get recordname(){ return this.submitForm.get('recordname') }

  submitData(submitForm) {
    let formData = new FormData()
    formData.append('file',this.uploadedFiles[0],this.uploadedFiles[0].name)
    formData.append('recordname',submitForm.value.recordname)
    formData.append('filename',submitForm.value.filename)
    this.dataService.submitData(formData)
    .subscribe(res=>{
      console.log(res)
    })
  }

  readData(submitForm) {
    if(this.userdataStatus){
      this.userdata = null
      this.userdataStatus = false
      this.buttonText = 'Show data'
    }
    else{
      this.dataService.readData(submitForm.value)
      .subscribe((res:any) => {
        this.userdata = res.data;
        this.userdataStatus = true
        this.buttonText = 'Hide data'
      })
    }
  }

  fileChange(element){
    this.uploadedFiles = element.target.files
  }
}
