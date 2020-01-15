import { Component } from '@angular/core'
import { UniverseDataService } from './service/universe-data.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'universe-poc';

  constructor(private dataService: UniverseDataService){

  }

  submitData(){
    console.log('working')
    let value = { id: 1365 }
    // this.dataService.submitData(value)
    // .subscribe(res=>{
    //   console.log(res)
    // })
  }
}
