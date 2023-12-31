import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DeleteListDialogComponent} from '../Widget/PopUp/DeleteListDialog/DeleteListDialog.component';
import { SeeListDialogComponent } from '../Widget/PopUp/SeeListDialog/SeeListDialog.component';
import { AddNewUserComponent } from '../Widget/PopUp/AddNewUser/AddNewUser.component';
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/compat/database";
import { ToastOptions, ToastaConfig, ToastaService } from 'ngx-toasta';

@Injectable({
  providedIn: 'root'
})

export class AdminPanelServiceService {

	sidenavOpen 	 : boolean = true;
	sidenavMode 	 : string = "side";
	chatSideBarOpen : boolean = true;
	editProductData : any;
	products  : AngularFireObject<any>;

	constructor(private http:HttpClient,
					private dialog: MatDialog,
					private db: AngularFireDatabase,
					private toastyService: ToastaService,
					private toastyConfig: ToastaConfig) { 

		this.toastyConfig.position = "top-right";
		this.toastyConfig.theme = "material";

	}


	public toastMessage(title , msg){
		let toastOption: ToastOptions = {
			title: title,
			msg: msg,
			showClose: true,
			timeout: 1500,
			theme: "material"
		};

		this.toastyService.wait(toastOption);
	}

	/*
		---------- Pop Up Function ----------
	*/

	//deleteDiaglog function is used to open the Delete Dialog Component.
	deleteDialog(data:string){
		let dialogRef : MatDialogRef<DeleteListDialogComponent>;
		dialogRef = this.dialog.open(DeleteListDialogComponent);
		dialogRef.componentInstance.data = data;

		return dialogRef.afterClosed();
	}

	//getProducts method is used to get the products.
   public getProducts() {
      this.products = this.db.object("products");
      return this.products;
   }

	//getTableTabContent method is used to get the transcation table data.
	getTableTabContent() {
		let tableContent : any;
		tableContent = this.db.object("transcationTable");
		return tableContent;
	}

	//getBuySellChartData method is used to get the buy and sell chart data.
	getBuySellChartContent() {
		let buySellChart : any;
		buySellChart = this.db.list("buySellChartData");
		return buySellChart;
	}

	//getInvoiceContent method is used to get the Invoice table data.
	getInvoiceContent() {
		let invoiceList : any;
		invoiceList = this.db.list("invoiceData");
		return invoiceList;
	}

	//getCollaborationContent method is used to get the Collaboration table data.
	getCollaborationContent () {
		let collaboration : any;
		collaboration = this.db.list("collaborationData");
		return collaboration;
	}

	//seeList function is used to open the see Dialog Component.
	seeList(id : any =''){
		let dialogRef : MatDialogRef<SeeListDialogComponent>;
		dialogRef = this.dialog.open(SeeListDialogComponent,{
			data: { id: id }
		});
	}

	//addNewUserDialog function is used to open Add new user Dialog Component.
	addNewUserDialog(){
		let dialogRef : MatDialogRef<AddNewUserComponent>;
		dialogRef = this.dialog.open(AddNewUserComponent);

		return dialogRef.afterClosed();
	}
}
