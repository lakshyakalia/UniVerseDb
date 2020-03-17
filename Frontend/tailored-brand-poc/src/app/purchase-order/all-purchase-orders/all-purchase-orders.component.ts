import { Component, OnInit } from '@angular/core'
import { PurchaseOrderService, Order } from '../../service/purchase-order.service'
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router'
import { FormControl, FormGroup } from '@angular/forms';

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

  purchaseOrderForm = new FormGroup({
    OrderNo: new FormControl(''),
    VendorName: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl('')
  })

  pagination(event){
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize

    this.rowId = this.pageIndex * this.pageSize + 1
    this.paginateOrders(this.pageIndex,this.pageSize)
  }

  paginateOrders(pageIndex,pageSize){
    let values = this.purchaseOrderForm.value
    values['pageIndex'] = pageIndex
    values['pageSize'] = pageSize
    
    this.purchaseOrderService.list(values).subscribe((res:any) =>{
      this.length = res.totalCount
      this.itemOrderList = res.data
    })
  }

  filter(values){
    values['pageIndex'] = 0
    values['pageSize'] = this.pageSize
    this.purchaseOrderService.list(values).subscribe((res:any) =>{
      this.length = res.totalCount
      this.itemOrderList = res.data
    })
  }

  openParticularOrder(orderNo) {
    this.router.navigate([`/order/edit/${orderNo}`])
  }
}
