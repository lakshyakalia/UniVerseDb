import { Component,Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
	selector: 'dialog-box',
	styles:['.heading{font-weight:100; font-size: 18px}','button{background-color: #77cc6d; color : white; font-weight: 500; margin-left: 90%; padding-left: 18px; padding-right:18px; border-radius : 4px; border:none ; }'],
	templateUrl: './purchase-dialog-box.component.ts',
	template:'<span class="heading">{{ data.msg }}</span><div><button (click)="closeDialogBox()">Ok</button></div>'
	
})
export class PurchaseDialogBoxComponent{
	constructor(
		public dialogRef: MatDialogRef<PurchaseDialogBoxComponent>,
		@Inject(MAT_DIALOG_DATA) public data: string
	){ }
	
	closeDialogBox() {
		this.dialogRef.close();
		window.location.reload()
	}
}
