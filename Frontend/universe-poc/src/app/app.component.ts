import { Component } from '@angular/core'
import { UniverseDataService } from './service/universe-data.service'
import { FormGroup, FormControl } from '@angular/forms'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data: any

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
    this.dataService.readData(value)
      .subscribe((res:any) => {
        this.data = res.data;
      })
  }
}
