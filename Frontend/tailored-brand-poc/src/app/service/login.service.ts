import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import{environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  baseUri:string =environment.baseUrl

  constructor(private http: HttpClient) { }
  login(loginDetails){
    console.log(loginDetails)
    return this.http.post(this.baseUri+'login',{
      loginDetails: loginDetails,

    })
  }
}
