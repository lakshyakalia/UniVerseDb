import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import{ environment } from'../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(private http: HttpClient) { }

  baseUri : string = environment.baseUrl

  post(purchaseOrderValues, itemOrderValues,submitStatus){
    return this.http.post(`${this.baseUri}api/order`,{
      purchaseOrderDetails: purchaseOrderValues,
      itemOrderDetails: itemOrderValues,
      submitStatus: submitStatus
    })
  }

  put(recordId, purchaseOrderValues, itemOrderValues, submitStatus){
    return this.http.put(`${this.baseUri}api/order/${recordId}`,{
      purchaseOrderDetails: purchaseOrderValues,
      itemOrderDetails: itemOrderValues,
      submitStatus: submitStatus
    })
  }

  list(){
    return this.http.get(`${this.baseUri}api/order`)
  }
  
  get(orderID){
    return this.http.get(`${this.baseUri}api/order/${orderID}`)
  }
}
