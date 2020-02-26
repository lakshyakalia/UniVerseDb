import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {

  constructor(private http: HttpClient) { }
  baseUri:string='http://localhost:5000/';
  readItem(){
    return this.http.get(this.baseUri+'api/item')
  }
  vendorUpdate(vendorDetail,itemId,vendorId){
    return this.http.put(this.baseUri+'api/vendor',{
      vendorDetail:vendorDetail,
      itemId:itemId,
      recordID: vendorId
    })
  }
  vendorDetail(vendorDetail,itemId,vendorId){
    return this.http.post(this.baseUri+'api/vendor',{
      vendorDetail:vendorDetail,
      itemId:itemId,
      recordID: vendorId
    })
  }
  particularVendor(vendorId){
    return this.http.get(this.baseUri+`api/vendor/${vendorId}`)
  }
  allVendors(){
    return this.http.get(this.baseUri+'api/vendor')
  }
}
