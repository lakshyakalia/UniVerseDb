import { Injectable } from '@angular/core'
import { HttpClient , HttpHeaders } from '@angular/common/http' 
import{environment} from'../../environments/environment'
import { Item, ItemService } from './item.service'
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Cacheable } from 'ngx-cacheable';
import { Observable } from 'rxjs';
import {Http, RequestOptions, Headers } from '@angular/http'


@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private _baseUri:string=environment.baseUrl;
  private _vendors: Vendor[] = []
  get vendors(): Vendor[] {
    this._prepareVendors()
    return this._vendors
  }
  private _names: string[] = []
  get names(): string[] {
    this._prepareNames()
    return this._names
  }
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

  constructor(private http: HttpClient, private itemService: ItemService) {
    this._prepareVendors()
    this._prepareNames()
    let headers = new Headers()
    headers.append('Authorization',`${localStorage.getItem('token')}`)
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

  @Cacheable({
    maxAge: 5 * 1000
  })
  private _list() {
    return this.http.get(this._baseUri+'api/vendor')
  }

  private _prepareVendors() {
    this._list().subscribe((res: any) => {
      this._vendors = []
      for(let vendorId in res.data){
        let record = res.data[vendorId]
        this._vendors.push(
          {
            id: record['@_ID'],
            company: record['@VEND.COMPANY'],
            name: record['@VEND.NAME'],
            phone: record['@VEND.PHONE'],
            items: record['ITEM.IDS_MV'].map(rawItem => {return {id: rawItem['@ITEM.IDS']}})
          }
        )
      }
    })
    return
  }

  private _prepareNames() {
    this._list().subscribe((res: any) => {
      this._names = []
      for(let vendorId in res.data){
        let record = res.data[vendorId]
        this._names.push(`${record['@_ID']} | ${record['@VEND.NAME']}`)
      }
    })
    return
  }
  
  typeahead = (text$: Observable<string>) => 
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(keyword => keyword.length < 2 ? []
      : this.names.filter(v => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1).slice(0, 10))
  )

  select(id: string) {
    this._selectedVendor = this._vendors.find(vendor => vendor.id == id)
    let itemIds = this._selectedVendor.items.map(item => item.id)
    let allItems = this.itemService.items()
    this._selectedVendorItemList = []
    this._selectedVendor.items = []
    itemIds.forEach(itemId => {
      this._selectedVendor.items.push(allItems.find(item => item.id == itemId))
    })
    this._selectedVendor.items.forEach(item => {
      this._selectedVendorItemList.push(`${item.id} | ${item.description}`)
    })
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
