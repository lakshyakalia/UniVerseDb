import { Component,Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router';
import { PurchaseOrderComponent } from '../purchase-order/purchase-order.component'
import { FormArray } from '@angular/forms';

@Component({
	selector: 'dialog-box',
	styles:['.heading{font-weight:100; font-size: 18px}','button{background-color: #77cc6d; color : white; font-weight: 500; margin-left: 90%; padding-left: 18px; padding-right:18px; border-radius : 4px; border:none ; display : inline }'],
	templateUrl: './purchase-dialog-box.component.ts',
	template:'<span class="heading">{{ data.msg }}</span><div><button (click)="reloadComponent()">Yes</button><button (click)="closeDialogBox()">No</button></div>'
	
})
export class PurchaseDialogBoxComponent{
	constructor(
		public dialogRef: MatDialogRef<PurchaseDialogBoxComponent>,
		@Inject(MAT_DIALOG_DATA) public data: string,
		private router : Router,
		// private purchaseOrder : PurchaseOrderComponent
	){ }
	
	
	closeDialogBox() {
		this.dialogRef.close({clear: false});
	}
	reloadComponent(){
		// this.purchaseOrder.clearFormArray()
		this.dialogRef.close({clear: true});
		// this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
		// 	this.router.navigate(['/order/new']);
		//   });
		//   this.purchaseOrder.i=this.purchaseOrder.purchaseOrderForm.value.VendorName;
	}
}
