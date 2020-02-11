import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {

  constructor(private http: HttpClient) { }

  saveItemData(itemData, shipToData){
    return this.http.post('/http://localhost:5000/api/save',{
      itemData: itemData,
      shipToData: shipToData
    })
  }
}
