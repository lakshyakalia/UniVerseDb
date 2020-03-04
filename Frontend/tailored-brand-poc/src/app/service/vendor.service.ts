import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http' 
import{environment} from'../../environments/environment'
import { Item, ItemService } from './item.service'
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
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
  get selectedVendor(): Vendor {
    return this._selectedVendor
  }
  private _selectedVendorItemList: string[]

  constructor(private http: HttpClient, private itemService: ItemService) {
    this.http.get(this._baseUri+'api/vendor')
    .subscribe((res: any) => {
      for(let vendorId in res.data)
      {
        let data = res.data[vendorId]
        this._vendors.push(
          {
            id: vendorId,
            company: data[0][0],
            name: data[0][1],
            phone: data[0][2],
            items: data[1].map(rawItem => {return {id: rawItem}})
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

  post(vendorDetail,itemId,vendorId){
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
