import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {

  constructor(private http: HttpClient) { }
  readItem(){
    return this.http.get('http://localhost:5000/api/item')
  }
  
  vendorDetail(vendorDetail,itemId,vendorId){
    return this.http.post('http://localhost:5000/api/vendor',{
      vendorDetail:vendorDetail,
      itemId:itemId,
      recordID: vendorId
    })
  }
  particularVendor(vendorId){
    return this.http.get(`http://localhost:5000/api/vendor/${vendorId}`)
  }
  allVendors(){
    return this.http.get('http://localhost:5000/api/vendor')
  }
}
