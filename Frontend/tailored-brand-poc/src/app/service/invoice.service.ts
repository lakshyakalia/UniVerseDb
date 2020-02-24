import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'


@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }
  submitNewInvoice(invoiceDetails){
    return this.http.post('http://localhost:5000/api/order',{

    })

  }
}
