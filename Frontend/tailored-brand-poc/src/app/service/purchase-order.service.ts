import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(private http: HttpClient) { }

  getAllVendorName(){
    return this.http.get('http://localhost:5000/api/vendor')
  }

  getParticularVendorItems(vendorName){
    return this.http.get('http://localhost:5000/api/vendor/items',{
      params: {
        vendorName: vendorName
      }
    })
  }

  getParticularItemDetails(itemID){
    return this.http.get('http://localhost:5000/api/vendor/item',{
      params: {
        item : itemID
      }
    })
  }
}
