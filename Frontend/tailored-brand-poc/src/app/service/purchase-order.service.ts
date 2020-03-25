import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'
import{ environment } from'../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(private http: HttpClient) { }

  baseUri : string = environment.baseUrl

  post(purchaseOrderValues, itemOrderValues,submitStatus){
    return this.http.post(`${this.baseUri}api/order`,{
      details: purchaseOrderValues,
      itemDetails: itemOrderValues["SpecialRequests"],
      status: submitStatus
    })
  }

  put(recordId, purchaseOrderValues, itemOrderValues, submitStatus){
    return this.http.put(`${this.baseUri}api/order/${recordId}`,{
      details: purchaseOrderValues,
      itemDetails: itemOrderValues["SpecialRequests"],
      status: submitStatus
    })
  }

  list(filter){
    return this.http.get(this.baseUri+`api/order`,{ 
      params: filter
    })
  }
  
  get(orderID){
    return this.http.get(`${this.baseUri}api/order/${orderID}`)
  }
}

export class Order{
  purchaseOrderNo : string
  orderDate : string
  companyName: string
}

export class UvResponse<T> {
  data: T
  lastOrder: T
}