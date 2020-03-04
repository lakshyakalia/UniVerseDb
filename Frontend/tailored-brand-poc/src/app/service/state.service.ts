import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class StateService {

  private _states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
    }
  private _stateList: string[]
  constructor() {
    this._stateList = this.list()
  }

  list(){
    let abbreviations = Object.keys(this._states);
    let keyPipeValues = [];
    for (let index = 0; index < abbreviations.length; index++) {
      let abbreviation = abbreviations[index];
      keyPipeValues.push(`${abbreviation} | ${this._states[abbreviation]}`)      
    }
    return keyPipeValues;
  }

  typeahead = (text$: Observable<string>) => 
  text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(keyword => keyword.length < 2 ? []
      : this._stateList.filter(v => v.toLowerCase().indexOf(keyword.toLowerCase()) > -1).slice(0, 10))
  )

}
