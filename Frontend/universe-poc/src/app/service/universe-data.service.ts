import { Injectable } from '@angular/core'
import { Http } from '@angular/http'

@Injectable({
  providedIn: 'root'
})
export class UniverseDataService {

  constructor(private http: Http) { }

  submitData(data){
    return this.http.post('/exceldata',data)
  }
}
