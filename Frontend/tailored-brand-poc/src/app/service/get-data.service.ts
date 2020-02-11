import { Injectable } from '@angular/core';
import {  HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  constructor(private  http: HttpClient) { }

  getPurchaseOrderData(){
    return this.http.get('http://localhost:5000/api/getData')
  }
}
