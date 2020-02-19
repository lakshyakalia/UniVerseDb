import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {

  constructor(private http: HttpClient) { }

  saveItemData(itemData, shipToData){
    return this.http.post('/http://localhost:5000/api/U2data',{
      itemData: itemData,
      shipToData: shipToData
    })
  }
  readItem(){
    return this.http.get('http://localhost:5000/api/U2data')
  }
  
  vendorDetail(vendorDetail,itemId,vendorId){
    return this.http.post('http://localhost:5000/api/vendorDetail',{
      vendorDetail:vendorDetail,
      itemId:itemId,
      recordID: vendorId
    })
  }
}
