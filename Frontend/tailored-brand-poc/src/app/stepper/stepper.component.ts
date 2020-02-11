import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent implements OnInit {

  constructor() { }

  firstFormGroup = new FormGroup({
    item : new FormControl(''),
    quantity: new FormControl('')
    
  })

  get item(){ return this.firstFormGroup.get('item') }

  get quantity(){ return this.firstFormGroup.get('quantity') }

  ngOnInit() {
  }

}
