import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class UniverseDataService {

  constructor(private http: HttpClient) { }

  submitData(data){
    console.log(data)
    return this.http.post('http://localhost:5000/api/U2data',data)
  }

  readData(data){
    console.log(data)
    return this.http.get('http://localhost:5000/api/U2data',{
      params: data
    })
  }

}
