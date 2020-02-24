import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {

  constructor(private http: HttpClient) { }

  saveItemData(itemData, shipToData){
    let data = {
      itemData: itemData,
      shipToData: shipToData
    }
    return this.http.post('http://localhost:5000/api/U2data',data)
  }
  readItem(){
    return this.http.get('http://localhost:5000/api/itemData')
  }
  
  vendorDetail(vendorDetail,itemId,vendorId){
    return this.http.post('http://localhost:5000/api/vendorDetail',{
      vendorDetail:vendorDetail,
      itemId:itemId,
      recordID: vendorId
    })
  }
  allVendors(){
    return this.http.get('http://localhost:5000/api/vendorDetail')
  }
}
