import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ItemService {

    private _baseUri:string=environment.baseUrl;
    private _itemList: string[]
    private _items: any

    constructor(private http: HttpClient) {
        this.http.get(this._baseUri+'api/item')
        .subscribe((res: any) => {
            this._items = res.table;
            let keyPipeValues = []
            let keys = Object.keys(this._items)
            for(let i = 0; i < keys.length; i++)
            {
                keyPipeValues.push(`${keys[i]} | ${this._items[keys[i]]}`)
            }
            this._itemList = keyPipeValues
        })
    }

    listRaw(){
        return this._items
    }

    list(){
        return this._itemList
    }

    typeahead = (text$: Observable<string>) => 
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(keyword => keyword.length < 2 ? []
            : this._itemList.filter(v => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1).slice(0, 10))
    )

}
export class Item {
    id: string
    name: string
    description: string
}