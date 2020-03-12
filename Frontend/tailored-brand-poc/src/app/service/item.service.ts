import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Cacheable } from 'ngx-cacheable';
@Injectable({
  providedIn: 'root'
})
export class ItemService {

    private _baseUri:string=environment.baseUrl;
    private _items: Item[]
    public items(): Item[] {
        this._prepareItems()
        return this._items
    }
    private _names: string[]
    public names(): string[] {
        this._prepareNames()
        return this._names
    }
    private _allOrderNo : any

    constructor(private http: HttpClient) {
        this._prepareItems()
        this._prepareNames()
    }

    @Cacheable({
        maxAge: 60 * 60 * 1000
    })
    private _list() {
        return this.http.get(this._baseUri+'api/item')
    }

    private _prepareItems() {
        this._list().subscribe((res: any) => {
            this._items = []
            for(let itemId in res.data){
                let record = res.data[itemId]
                this._items.push({
                    id: record['@_ID'],
                    description: record['@DESC']
                })
            }
        })
    }

    private _prepareNames() {
        this._list().subscribe((res: any) => {
            this._names = []
            for(let itemId in res.data){
                let record = res.data[itemId]
                this._names.push(`${record['@_ID']} | ${record['@DESC']}`)
            }
        })
    }

    typeahead = (text$: Observable<string>) => 
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(keyword => keyword.length < 2 ? []
            : this.names().filter(v => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1).slice(0, 10))
    )

    search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? [] : this._allOrderNo.filter(v => v.indexOf(term.toString()) > -1))
    )

    listOrder(allOrderNo){
        this._allOrderNo = allOrderNo
    }
}
export class Item {
    id: string
    description: string
}