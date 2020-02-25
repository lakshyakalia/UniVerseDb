import { Component, OnInit } from '@angular/core'
import { PurchaseOrderService } from '../../service/purchase-order.service'

@Component({
  selector: 'app-all-purchase-orders',
  templateUrl: './all-purchase-orders.component.html',
  styleUrls: ['./all-purchase-orders.component.css']
})
export class AllPurchaseOrdersComponent implements OnInit {
  
  itemOrderList : []

  constructor(private purchaseOrderService: PurchaseOrderService) { }

  ngOnInit() {
    this.purchaseOrderService.getAllOrders()
    .subscribe((res:any)=>{
      this.itemOrderList = res.list
    })
  }

}
