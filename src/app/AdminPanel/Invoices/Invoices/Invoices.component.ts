import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AdminPanelServiceService } from '../../Service/AdminPanelService.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';
import { map } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-invoices',
  templateUrl: './Invoices.component.html',
  styleUrls: ['./Invoices.component.scss']
})

export class InvoicesComponent implements OnInit {

	popUpDeleteUserResponse : any;
	invoiceList             : any [] = [];

   @ViewChild(MatPaginator) paginator : MatPaginator;

   dataSource = new MatTableDataSource<any>(this.invoiceList);

	subscription : any ;

   displayedColumns : string[] = ['invoiceId', 'name', 'date','price','status','action'];


   searchByInvoiceId;
   status : any = 'all';

   startDate;
   endDate;

   totalPages = 1;
   currentPage = 0;


   size = 15;

	constructor(public service : AdminPanelServiceService,
      private httpReq : HttpRequestService,
      private cdr: ChangeDetectorRef,
      private datePipe: DatePipe) { }

	ngOnInit() {
      this.getOrders()
	}

   ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
   }


   public getOrders(invoiceId = null) {

      let body = {
         size: this.size,
         page: this.currentPage,
         status: this.status !== 'all' ? this.status : null,
         fromDate: this.startDate ? this.datePipe.transform(this.startDate, 'dd/MM/yyyy') : null,
         toDate: this.endDate ? this.datePipe.transform(this.endDate, 'dd/MM/yyyy') : null,
         invoiceId: invoiceId
     };

      var payload = {
         apiName: 'getOrders',
         body: body,
         method: 'POST'
         };
      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .subscribe(
         data => {
            this.invoiceList = data.order;
            this.dataSource = new MatTableDataSource<any>(this.invoiceList);
            this.totalPages = data.totalPages;
            setTimeout(()=>{
               // this.paginator.length = this.totalPages || 1;
               // this.paginator.length = this.totalPages * this.size || 1; // If totalPages represents the number of total pages, then you need to multiply it by the size to get the total number of records
            },0)
         },
         error => {
            // Handle the subscription error here
            console.error('An error occurred:', error);
         }
         );
   }

   onPaginateChange(event: PageEvent) {
      this.size = event.pageSize;
      this.currentPage = event.pageIndex;
      this.getOrders();
      this.cdr.detectChanges();
  }

	/** 
     *onDelete method is used to open a delete dialog.
     */
   onDelete(i){
      this.service.deleteDialog("Are you sure you want to delete this invoice permanently?").
         subscribe( res => {this.popUpDeleteUserResponse = res},
                    err => console.log(err),
                    ()  => this.getDeleteResponse(this.popUpDeleteUserResponse,i))
   }

   /**
     * getDeleteResponse method is used to delete a invoice from the invoice list.
     */
   getDeleteResponse(response : string, i){
      if(response == "yes"){
         this.dataSource.data.splice(i,1);
         this.dataSource = new MatTableDataSource(this.dataSource.data);
         this.dataSource.paginator = this.paginator;
      }
   }

   /**
     * onSeeDialog method is used to open a see dialog.
     */
   onSeeDialog(product){
      this.service.seeList(product.id);
   }


   updateOrderStatus(event: MatSelectChange, element: any){

      element.status = event.value;

      var payload = {
         apiName: 'updateOrder',
         body: element,
         method: 'POST'
         };
      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .subscribe(
         data => {
            this.service.toastMessage('Status', 'The Status updated succefully');
         },
         error => {
            // Handle the subscription error here
            console.error('An error occurred:', error);
            this.service.toastMessage('Status', 'Sorry Abnormal error');
         }
         );
   }

   onStartDateChange() {
      if (this.startDate && this.endDate) {
          this.getOrders();
      }
  }
  
  onEndDateChange() {
      if (this.startDate && this.endDate) {
         this.getOrders();
      }
  }

  addInvoiceIdtoSearch(){
   if(this.searchByInvoiceId && this.searchByInvoiceId.trim() != ''){
      this.getOrders(this.searchByInvoiceId.trim());
   }else{
      this.getOrders(null);

   }
  }

   ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
}
