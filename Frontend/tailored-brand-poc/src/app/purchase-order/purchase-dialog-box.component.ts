import { Component,Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
	selector: 'dialog-box',
	templateUrl: './purchase-dialog-box.component.ts',
	template:'<span mat-dialog-title>{{ data.msg }}</span><div mat-dialog-actions><button mat-button (click)="closeDialogBox()">Ok</button></div>'
	
})
export class PurchaseDialogBoxComponent{
	constructor(
		public dialogRef: MatDialogRef<PurchaseDialogBoxComponent>,
		@Inject(MAT_DIALOG_DATA) public data: string
	){ }
	
	closeDialogBox() {
		this.dialogRef.close();
	}
}
