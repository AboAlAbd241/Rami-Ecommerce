import { Component, Inject, OnInit } from '@angular/core';
import { PerfectScrollbarConfigInterface,PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';


@Component({
  selector: 'app-see-list-dialog',
  templateUrl: './SeeListDialog.component.html',
  styleUrls: ['./SeeListDialog.component.scss']
})
export class SeeListDialogComponent implements OnInit {

  public config: PerfectScrollbarConfigInterface = {};

	todayDate = new Date();

	subscription : any ;

  product      : any ; 

	
	constructor(public dialogRef : MatDialogRef<SeeListDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any
  ,private httpReq : HttpRequestService) { }
  

	ngOnInit() {
    this.getOrders(this.data)
	}

  
  public getOrders(data) {
    var payload = {
       apiName: 'getOrderById',
       body: data,
       method: 'POST'
       };
    
       this.subscription = this.httpReq.makeHttpRequest(payload)
       .pipe(
       map(res => res)
       )
       .subscribe(
       data => {
        this.product = data.order;
       },
       error => {
          // Handle the subscription error here
          console.error('An error occurred:', error);
       }
       );
 }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
