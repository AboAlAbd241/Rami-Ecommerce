import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, UntypedFormGroup, UntypedFormBuilder,FormArray, Validators } from '@angular/forms';
import { EmbryoService } from '../../../Services/Embryo.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-Payment',
  templateUrl: './Payment.component.html',
  styleUrls: ['./Payment.component.scss']
})
export class PaymentComponent implements OnInit, AfterViewInit{

   step = 0;
   isDisabledPaymentStepTwo  = true;
   isDisabledPaymentStepThree = false;
   // emailPattern        : any = /\S+@\S+\.\S+/;
 
	subscription : any ;


   paymentFormOne   : UntypedFormGroup;

   constructor(public embryoService : EmbryoService, 
               private formGroup : UntypedFormBuilder,
               public router: Router,
               private httpReq : HttpRequestService) {

      this.embryoService.removeBuyProducts();
   }

   ngOnInit() {

      this.paymentFormOne = this.formGroup.group({
         user_details       : this.formGroup.group({
            first_name         : ['', [Validators.required]],
            last_name          : ['', [Validators.required]],
            shippingAddress : ['', [Validators.required]],
            shippingCity         : ['', [Validators.required]],
            mobile             : ['', [Validators.required]],
            // email              : ['', [Validators.required, Validators.pattern(this.emailPattern)]],
            // share_email        : ['', [Validators.pattern(this.emailPattern)]],
         }),
         // offers             : this.formGroup.group({
         //    discount_code   : [''],
         //    card_type       : [1],
         //    card_type_offer_name  : [null]
         // }),
      });
   }

   ngAfterViewInit() {
   }

   public setStep(index: number) {
      this.step = index;
      switch (index) {
         case 0:
            this.isDisabledPaymentStepTwo = true;
            this.isDisabledPaymentStepThree = true;
            break;
         case 1:
            this.isDisabledPaymentStepThree = false;
            break;
         default:
            
            break;
      }
   }

   public toggleRightSidenav() {
      this.embryoService.paymentSidenavOpen = !this.embryoService.paymentSidenavOpen;
   }

   public getCartProducts() {
      let total = 0;
      if(this.embryoService.localStorageCartProducts && this.embryoService.localStorageCartProducts.length>0) {
         for(let product of this.embryoService.localStorageCartProducts) {
            if(!product.quantity){
               product.quantity = 1;
            }
            total += (product.price*product.quantity);
         }
         total += (this.embryoService.shipping+this.embryoService.tax);
         return total;
      } 
      return total; 
   }

   public submitPayment() {
      let userDetailsGroup = <UntypedFormGroup>(this.paymentFormOne.controls['user_details']);
      if(userDetailsGroup.valid)
      {
         switch (this.step) {
            case 0:
               this.step = 1;
               this.isDisabledPaymentStepTwo = false;
               break;
            case 1:
               this.step = 2;
               break;
            
            default:
               // code...
               break;
         }
      } else {
         this.isDisabledPaymentStepTwo = true;
         this.isDisabledPaymentStepThree = true;
         for (let i in userDetailsGroup.controls) {
            userDetailsGroup.controls[i].markAsTouched();
         }
      }
   }

   // public selectedPaymentTabChange(value) {
   //    let paymentGroup = <UntypedFormGroup>(this.paymentFormOne.controls['payment']); 

   //    paymentGroup.markAsUntouched();

   //    if(value && value.index == 1) {
   //          paymentGroup.controls['card_number'].clearValidators();
   //          paymentGroup.controls['user_card_name'].clearValidators();
   //          paymentGroup.controls['cvv'].clearValidators();
   //          paymentGroup.controls['expiry_date'].clearValidators();

   //          paymentGroup.controls['bank_card_value'].setValidators([Validators.required]); 
   //    } else {
        
   //       paymentGroup.controls['card_number'].setValidators([Validators.required]); 
   //       paymentGroup.controls['user_card_name'].setValidators([Validators.required]); 
   //       paymentGroup.controls['cvv'].setValidators([Validators.required]); 
   //       paymentGroup.controls['expiry_date'].setValidators([Validators.required]); 

   //       paymentGroup.controls['bank_card_value'].clearValidators();
   //    }

   //    paymentGroup.controls['card_number'].updateValueAndValidity();
   //    paymentGroup.controls['user_card_name'].updateValueAndValidity();
   //    paymentGroup.controls['cvv'].updateValueAndValidity();
   //    paymentGroup.controls['expiry_date'].updateValueAndValidity();
   //    paymentGroup.controls['bank_card_value'].updateValueAndValidity();
   // }

   public finalStep() {
      let paymentGroup = <UntypedFormGroup>(this.paymentFormOne.controls['user_details']);
      if(paymentGroup.valid) {
         
         this.makeOrder()

         this.embryoService.addBuyUserDetails(this.paymentFormOne.value);
         this.router.navigate(['/checkout/final-receipt']);
      } else {
         for (let i in paymentGroup.controls) {
            paymentGroup.controls[i].markAsTouched();
         }
      }
   }

   makeOrder(){
      let products = JSON.parse(localStorage.getItem("cart_item"))
      let totalPrice = 0;

      let body = {
         guestName : this.paymentFormOne.value.user_details.first_name + " "+ this.paymentFormOne.value.user_details.last_name,
         shippingCity : this.paymentFormOne.value.user_details.shippingCity,
         guestPhone : this.paymentFormOne.value.user_details.mobile,
         shippingAddress : this.paymentFormOne.value.user_details.shippingAddress,
         orderItems : [],
         status : "NEW",
         totalPrice : 0,
         invoiceId: products[0]?.invoiceId,
      }

      let order;
      for(let product of products){
         order = {
               product:{
                  "id": product.id
               },
               "productColor":{
                  "id":product?.selectedColor?.id ? product?.selectedColor?.id : null 
               },
               "productStorageOption":{
                  "id":product?.selectedStorage?.id ? product?.selectedStorage?.id : null
               },
               "quantity": product.quantity,
               "purchasePrice": product.price,
            }

            totalPrice += (product.price * product.quantity);

            body.orderItems.push(order);
      }

      body.totalPrice = totalPrice;

      var payload = {
         apiName: 'createAnOrder',
         body: body,
         method: 'POST'
         };
      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .pipe(
         map(res => res)
         )
         .subscribe(
         data => {
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



