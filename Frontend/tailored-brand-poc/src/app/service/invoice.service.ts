import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }
  submitNewInvoice(invoiceDetails,submitStatus){
    // console.log(invoiceDetails.invoiceNo)
    return this.http.post('http://localhost:5000/api/invoice',{
      invoiceDetails: invoiceDetails,
      submitStatus: submitStatus

    })
    
  }
  getInvoice(invoiceId){
    return this.http.get(`http://localhost:5000/api/invoice/${invoiceId}`)
  }
  getParticularOrder(orderID){
    return this.http.get(`http://localhost:5000/api/invoice/order/${orderID}`)
  }
}
