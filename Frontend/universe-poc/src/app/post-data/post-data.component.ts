import { Component } from '@angular/core';
import { UniverseDataService } from '../service/universe-data.service'
import { FormGroup, FormControl } from '@angular/forms'

@Component({
  selector: 'app-post-data',
  templateUrl: './post-data.component.html',
  styleUrls: ['./post-data.component.css']
})
export class PostDataComponent {

  uploadedFiles: Array<File>

  constructor(private dataService: UniverseDataService) {

  }

  submitForm = new FormGroup({
    filename: new FormControl(),
    recordname: new FormControl()
  })

  get filename() { return this.submitForm.get('filename') }

  get recordname() { return this.submitForm.get('recordname') }

  submitData(submitForm) {
    let formData = new FormData()
    formData.append('file', this.uploadedFiles[0], this.uploadedFiles[0].name)
    formData.append('recordname', submitForm.value.recordname)
    formData.append('filename', submitForm.value.filename)
    this.dataService.submitData(formData)
      .subscribe(res => {
        console.log(res)
      })
  }

}
