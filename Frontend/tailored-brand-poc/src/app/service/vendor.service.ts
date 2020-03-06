import { Injectable } from '@angular/core'
import { HttpClient , HttpHeaders } from '@angular/common/http' 
import{environment} from'../../environments/environment'
import { Item, ItemService } from './item.service'
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {Http, RequestOptions, Headers } from '@angular/http'


@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private _baseUri:string=environment.baseUrl;
  private _vendorList: string[] = []
  private _vendors: Vendor[] = []
  private _selectedVendor: Vendor = {
    id: "",
    company: "",
    name: "",
    phone: "",
    items: []
  }
  token:any;
  get selectedVendor(): Vendor {
    return this._selectedVendor
  }
  private _selectedVendorItemList: string[]

  constructor(private http: Http, private itemService: ItemService) {
    let headers = new Headers()
    headers.append('Authorization',`${localStorage.getItem('token')}`)
   
    this.http.get(this._baseUri+'api/vendor',{ headers: headers})
    .subscribe((res: any) => {
      for(let vendorId in res.vendorData){
        let data = res.vendorData[vendorId]
        this._vendors.push(
          {
            id: data['@_ID'],
            company: data['@VEND.COMPANY'],
            name: data['@VEND.NAME'],
            phone: data['@VEND.PHONE'],
            items: data['ITEM.IDS_MV'].map(rawItem => {return {id: rawItem['@ITEM.IDS']}})
          }
        )

      }
      for(let index in this._vendors)
      {
        this._vendorList.push(`${this._vendors[index].id} | ${this._vendors[index].name}`)
      }
    })
  }
  put(vendorDetail,itemId,vendorId){
    return this.http.put(`${this._baseUri}api/vendor/${vendorId}`,{
      vendorDetail:vendorDetail,
      itemId:itemId
    })
  }

  post(vendorDetail,itemId){
    return this.http.post(this._baseUri+'api/vendor',{
      vendorDetail:vendorDetail,
      itemId:itemId
    })
  }

  get(vendorId){
    return this.http.get(this._baseUri+`api/vendor/${vendorId}`)
  }
  
  listRaw(){
    return this._vendors
  }

  list(){
      return this._vendorList
  }
  
  typeahead = (text$: Observable<string>) => 
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(keyword => keyword.length < 2 ? []
      : this._vendorList.filter(v => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1).slice(0, 10))
  )

  select(id: string) {
    this._selectedVendor = this._vendors.find(vendor => vendor.id == id)
    let itemIds = this._selectedVendor.items.map(item => item.id)
    // TODO: Optimize when item.service is refactored to receive Item Records instead of raw data
    this._selectedVendorItemList = []
    let allItems = this.itemService.list()
    let allItemsRaw = this.itemService.listRaw()
    this._selectedVendor.items = []
    itemIds.forEach(itemId => {
      this._selectedVendorItemList.push(allItems.find(item => item.includes(itemId)))
      this._selectedVendor.items.push({id: itemId, name: "TODO: Fix item.service", description: allItemsRaw[itemId][0]})
    });
  }
  
  itemTypeahead = (text$: Observable<string>) => 
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(keyword => keyword.length < 2 ? []
      : this._selectedVendorItemList.filter(v => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1).slice(0, 10))
  )
}
export class Vendor {
  id: string
  company: string
  name: string
  phone: string
  items: Item[]
}
