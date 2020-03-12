import { Component, OnInit } from '@angular/core'
import { PurchaseOrderService, Order } from '../../service/purchase-order.service'
import {MatPaginatorModule} from '@angular/material/paginator';
import { Router } from '@angular/router'

@Component({
  selector: 'app-all-purchase-orders',
  templateUrl: './all-purchase-orders.component.html',
  styleUrls: ['./all-purchase-orders.component.css']
})
export class AllPurchaseOrdersComponent implements OnInit {
  length : number;
  pageIndex = 0
  pageSize = 5;
  itemOrderList: []

  rowId : number = 0

  ngOnInit() { 
    let event = {
      pageIndex : this.pageIndex,
      pageSize : this.pageSize
    }

    this.pagination(event)
  }

  paginationRecords : string

  constructor(private router: Router, private purchaseOrderService: PurchaseOrderService) { }

  pagination(event){
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize

    this.rowId = this.pageIndex * this.pageSize + 1
    this.paginateOrders(this.pageIndex,this.pageSize)
  }

  paginateOrders(pageIndex,pageSize){
    this.purchaseOrderService.pagination(pageIndex,pageSize,true).subscribe((res:any) =>{
      this.length = res.totalOrders
      this.itemOrderList = res.data.map(record => <Order>{
        purchaseOrderNo: record['@_ID'],
        orderDate: record['@ORDER.DATE'],
        companyName: record['@VEND.NAME']
      })
    })
  }

  openParticularOrder(orderNo) {
    this.router.navigate([`/order/edit/${orderNo}`])
  }

}
