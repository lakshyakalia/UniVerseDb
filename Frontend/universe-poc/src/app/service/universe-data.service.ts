import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class UniverseDataService {

  constructor(private http: HttpClient) { }

  submitData(formdata){
    return this.http.post('http://localhost:5000/api/U2data',formdata)
  }

  readData(data){
    return this.http.get('http://localhost:5000/api/U2data',{
      params: data
    })
  }

}
