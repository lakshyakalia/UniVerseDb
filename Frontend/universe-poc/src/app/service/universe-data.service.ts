import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class UniverseDataService {

  constructor(private http: HttpClient) { }

  submitData(formdata){
    const httpOptions = {
      headers : new HttpHeaders({
        'Content-Type': 'multipart/form-data'
      })
    }
    return this.http.post('http://localhost:5000/api/U2data',formdata)
  }

  readData(data){
    return this.http.get('http://localhost:5000/api/U2data')
  }

}
