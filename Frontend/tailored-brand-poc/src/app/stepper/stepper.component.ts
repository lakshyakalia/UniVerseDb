import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GetDataService } from '../service/get-data.service';

@Component({
  selector: 'stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent implements OnInit {

  constructor(private getData: GetDataService) { }

  firstFormGroup = new FormGroup({
    item: new FormControl(''),
    quantity: new FormControl('')

  })

  get item() { return this.firstFormGroup.get('item') }

  get quantity() { return this.firstFormGroup.get('quantity') }

  secondFormGroup = new FormGroup({
    companyName: new FormControl(''),
    contact: new FormControl(''),
    address: new FormControl(''),
    phoneno: new FormControl('')
  })

  get companyName() { return this.secondFormGroup.get('companyName') }

  get contact() { return this.secondFormGroup.get('contact') }

  get address() { return this.secondFormGroup.get('address') }

  get phoneno() { return this.secondFormGroup.get('phoneno') }

  ngOnInit() {
    this.getData.getPurchaseOrderData()
      .subscribe((res) => {
        console.log(res)
      })

  }

}
