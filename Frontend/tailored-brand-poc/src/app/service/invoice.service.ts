import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import{environment} from '../../environments/environment';
import { Cacheable } from 'ngx-cacheable';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  baseUri:string =environment.baseUrl
  constructor(private http: HttpClient) { }

  post(invoiceDetails,submitStatus){
    return this.http.post(this.baseUri+'api/invoice',{
      invoiceDetails: invoiceDetails,
      submitStatus: submitStatus
    })
  }
  
  getInvoice(invoiceId){
    return this.http.get(this.baseUri+`api/invoice/${invoiceId}`)
  }
  
  getParticularOrder(orderID){
    return this.http.get(this.baseUri+`api/invoice/order/${orderID}`)
  }
  
  @Cacheable({
    maxAge: 5 * 1000
  })
  list(filter){
    return this.http.get(this.baseUri+`api/invoices`,{
      params: filter
    })
  }
}
export class Invoice {
  id: string
  orderNumber: string
  amount: string
}
export class UvResponse<T> {
  data: T
}