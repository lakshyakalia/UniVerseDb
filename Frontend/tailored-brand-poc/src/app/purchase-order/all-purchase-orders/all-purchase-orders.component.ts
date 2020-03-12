import { Component, OnInit } from '@angular/core'
import { PurchaseOrderService, Order } from '../../service/purchase-order.service'

import { Router } from '@angular/router'

@Component({
  selector: 'app-all-purchase-orders',
  templateUrl: './all-purchase-orders.component.html',
  styleUrls: ['./all-purchase-orders.component.css']
})
export class AllPurchaseOrdersComponent implements OnInit {

  itemOrderList: []

  skipLimit: number = 0

  disablePrevButton: boolean

  disableNextButton: boolean

  paginationRecords : string

  constructor(private router: Router, private purchaseOrderService: PurchaseOrderService) { }

  listOrder(skipLimit) {
    if (skipLimit === 0) this.disablePrevButton = true
    else this.disablePrevButton = false

    this.purchaseOrderService.list(skipLimit,true).subscribe((res: any) => {
      
      this.disableNextButton = res.lastOrder
      if(res.lastOrder){
        this.paginationRecords = `Showing ${this.skipLimit + 1}-${ res.totalOrders } of ${res.totalOrders} records`
      }
      else{
        this.paginationRecords = `Showing ${this.skipLimit + 1}-${this.skipLimit + 5} of ${res.totalOrders} records`
      }
      this.itemOrderList = res.data.map(record => <Order>{
        purchaseOrderNo: record['@_ID'],
        orderDate: record['@ORDER.DATE'],
        companyName: record['@VEND.NAME']
      })
    })
  }

  ngOnInit() {
    this.listOrder(this.skipLimit)

  }

  openParticularOrder(orderNo) {
    this.router.navigate([`/order/edit/${orderNo}`])
  }

  nextPagination() {
    this.disablePrevButton = false
    this.skipLimit = this.skipLimit + 5
    this.listOrder(this.skipLimit)
  }

  previousPagination() {
    this.skipLimit = this.skipLimit - 5
    this.listOrder(this.skipLimit)
  }
}
