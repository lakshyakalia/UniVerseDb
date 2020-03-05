import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';
import{Router} from '@angular/router'
import { LoginService } from '../service/login.service'

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  loginForm: FormGroup;
  constructor(
    private router: Router,
    private loginService: LoginService
    
  ) { }
token:any;
  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl('',[Validators.required]),
      password: new FormControl('',[Validators.required])
    })
    if (localStorage.getItem("token") === null) {
    }
  }
  checkValidation() {
    let status = true
    if (this.loginForm.invalid) {
      this.loginForm.get('username').markAsTouched()
      this.loginForm.get('password').markAsTouched()

      status = false
    }
    return status
  }
  login(){
    if(!this.checkValidation())
    {
      return
    }
    else {
      this.loginService.login(this.loginForm.value)
      .subscribe((res:any) => {
        console.log(res)
        if(res.status==200)
        {
        this.token=res.token;
          console.log(this.token)
        }
      })
      console.log(this.token)
      localStorage.setItem('token',this.token)
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/home']);
      });
    }
  }

}
