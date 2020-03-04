import { Component, OnInit } from '@angular/core'
import { PurchaseOrderService } from '../../service/purchase-order.service'

import { Router } from '@angular/router'

@Component({
  selector: 'app-all-purchase-orders',
  templateUrl: './all-purchase-orders.component.html',
  styleUrls: ['./all-purchase-orders.component.css']
})
export class AllPurchaseOrdersComponent implements OnInit {
  
  itemOrderList : []

  constructor(private router: Router,private purchaseOrderService: PurchaseOrderService) { }

  ngOnInit() {
    this.purchaseOrderService.list()
    .subscribe((res:any)=>{
      this.itemOrderList = res.itemOrderList
    })
  }

  openParticularOrder(orderNo){
    this.router.navigate([`/order/edit/${orderNo}`])
  }
}
