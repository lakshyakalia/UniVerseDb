import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }
  submitNewInvoice(invoiceDetails){
    return this.http.get('http://localhost:5000/api/invoice',{


    })

  }
  getParticularOrder(orderID){
    return this.http.get(`http://localhost:5000/api/invoice/order/${orderID}`)
  }
}
