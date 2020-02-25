import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(private http: HttpClient) { }

  getAllVendorName(){
    return this.http.get('http://localhost:5000/api/vendorDetail')
  }

  getParticularItemDetails(itemID){
    return this.http.get('http://localhost:5000/api/item',{
      params: {
        item : itemID
      }
    })
  }

  submitNewOrder(purchaseOrderValues, itemOrderValues,recordId,submitStatus){
    return this.http.post('http://localhost:5000/api/order',{
      purchaseOrderDetails: purchaseOrderValues,
      itemOrderDetails: itemOrderValues,
      recordID: recordId,
      submitStatus: submitStatus
    })
  }

  getAllOrders(){
    return this.http.get('http://localhost:5000/api/order')
  }
  
  getParticularOrder(orderID){
    return this.http.get(`http://localhost:5000/api/order/${orderID}`)
  }
}
