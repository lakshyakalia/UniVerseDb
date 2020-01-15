import { Component } from '@angular/core';
import { UniverseDataService } from './service/universe-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'universe-poc';
  data:any
  constructor(private dataservice: UniverseDataService)
  {}
  readData(value){
    this.dataservice.readData(value)
    .subscribe(res=>{
      this.data=res.data;
    })
  }
}
