import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import{ environment } from'../../environments/environment'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  list(): Observable<Order[]>{
    return this.http.get<UvResponse<[]>>(this.baseUri+`api/order`).pipe(
      map(response => response.data.map(record => 
        <Order>{
          purchaseOrderNo: record['@_ID'],
          orderDate: record['@ORDER.DATE'],
          companyName: record['@VEND.NAME']
        }
      ))
    )
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
}