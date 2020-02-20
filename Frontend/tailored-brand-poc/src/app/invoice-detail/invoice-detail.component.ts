import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder,  Validators } from '@angular/forms';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceForm : FormGroup;
  constructor() { }

  ngOnInit() {
    this.invoiceForm = new FormGroup({
       invoiceNo : new FormControl(),
       invoiceDate: new FormControl(),
       orderNo : new FormControl(),
       invoiceAmount : new FormControl()

    });
  }
  sub(): void{
    console.log(this.invoiceForm.value.invoiceNo);
    if(this.invoiceForm.value.invoiceNo==null)
    {
      alert('enter a value')
    }
  }

}