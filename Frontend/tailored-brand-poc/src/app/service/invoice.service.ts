import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import{environment} from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  baseUri:string =environment.baseUrl
  constructor(private http: HttpClient) { }

  submitNewInvoice(invoiceDetails,submitStatus){
    // console.log(invoiceDetails.invoiceNo)
    return this.http.post(this.baseUri+'api/invoice',{
      invoiceDetails: invoiceDetails,
      submitStatus: submitStatus

    })
    
  }
  allInvoice()
  {
    return this.http.get(this.baseUri+'api/invoice')
  }
  getInvoice(invoiceId){
    return this.http.get(this.baseUri+`api/invoice/${invoiceId}`)
  }
  getParticularOrder(orderID){
    return this.http.get(this.baseUri+`api/invoice/order/${orderID}`)
  }
}
