import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminPanelServiceService } from '../../Service/AdminPanelService.service';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';

@Component({
	selector: 'app-reports',
	templateUrl: './Reports.component.html',
	styleUrls: ['./Reports.component.scss']
})

export class ReportsComponent implements OnInit {

   tableTabData        : any;
   buySellChartContent : any;
   chartData           : any;

   displayedTransactionColumns : string [] = ['transid','date','account', 'type', 'amount','debit', 'balance'];

   displayedTransferColumns : string [] = ['transid','date','account', 'type', 'amount', 'balance','status'];

   displayedExpenseColumns : string [] = ['itmNo','date', 'type','companyName','amount','status'];

	subscription : any ;


   constructor(private service : AdminPanelServiceService,
      private httpReq : HttpRequestService) {
   }

   ngOnInit() {
      // this.service.getTableTabContent().valueChanges().subscribe(res => this.tableTabData = res);
      this.getReportData();

   }

   //getChartData method is used to get the chart data.
   getChartData(data){
      this.buySellChartContent= data;
      this.chartDataChange('week');
   }

   //chartDataChange method is used to change the chart data according to button event.
   chartDataChange(tag){
      if(this.buySellChartContent && this.buySellChartContent.length>0)
      for(var content of this.buySellChartContent){
         if(content.tag == tag){
            this.chartData = content;
         }
      }
   }

   public getReportData() {

      let body = {
         status: "PAID",
     };

      var payload = {
         apiName: 'getReport',
         body: body,
         method: 'POST'
         };
      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .subscribe(
         data => {
            this.getChartData(data)
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
