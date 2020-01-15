import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {
  constructor() { }

  @Input() userdata : any

  ngOnInit() {
  }

}
