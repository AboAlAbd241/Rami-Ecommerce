import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { EmbryoService } from '../../../Services/Embryo.service';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'HeaderOne',
  templateUrl: './HeaderOne.component.html',
  styleUrls: ['./HeaderOne.component.scss']
})
export class HeaderOneComponent implements OnInit {

   toggleActive     : boolean = false;
   cartProducts     : any;
   popupResponse    : any;
   // wishlistProducts : any;
   subscription     : any ;

   isSearchVisible = false;
   isLoading = false;


   searchTerm ={search : '', size : 5, page : 0};
   searchResults = [];
   searchControl = new FormControl();
   isFocused: boolean = false;


   constructor(public embryoService: EmbryoService,private httpReq : HttpRequestService,
               private router: Router,
               cdRef: ChangeDetectorRef) {

      this.embryoService.calculateLocalCartProdCounts();

   }

   ngOnInit() {
   }


   onSearchChange(searchValue: string): void {  

      this.searchTerm.search = searchValue;
      this.search(this.searchTerm);
  }

   public search(searchValue) {
      this.isLoading = true; // Set loading to true when the search starts

      var payload = {
         apiName: 'getProductByTextSearch',
         body: searchValue,
         method: 'POST'
         };

      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .pipe(
         map(res => res)
         )
         .subscribe(
         data => {
            this.searchResults = data.products;
            this.isLoading = false; // Set loading to false when the search completes

         },
         error => {
            // Handle the subscription error here
            console.error('An error occurred:', error);
            this.isLoading = false; // Set loading to false when the search completes

         }
         );
   }

   public toggleSearch() {
      // document.querySelector('app-main').classList.toggle('form-open');
      this.isSearchVisible = !this.isSearchVisible;
      if(this.isSearchVisible) {
         // This is a small delay to focus on the input after it becomes visible.
         setTimeout(() => {
            (document.querySelector('input[matInput]') as HTMLInputElement).focus();
         });
         
      }
   }

   public toggleSidebar()
   {
      this.embryoService.sidenavOpen = !this.embryoService.sidenavOpen;
   }

   public openConfirmationPopup(value:any) {
      let message = "Are you sure you want to delete this product?";
      this.embryoService.confirmationPopup(message).
         subscribe(res => {this.popupResponse = res},
                   err => console.log(err),
                   ()  => this.getPopupResponse(this.popupResponse, value, 'cart')
                  );
   }

   public getPopupResponse(response:any, value:any, type) {
      if(response) {
         if(type == 'cart'){
            this.embryoService.removeLocalCartProduct(value);
         } else {
            this.embryoService.removeLocalWishlistProduct(value);
         }
      }
   }

   public addAllWishlistToCart(values:any) {
      this.embryoService.addAllWishListToCart(values);
   } 

   // public openWishlistConfirmationPopup(value:any) {
   //    let message = "Are you sure you want to add all products?";
   //    this.embryoService.confirmationPopup(message).
   //       subscribe(res => {this.popupResponse = res},
   //                 err => console.log(err),
   //                 ()  => this.getPopupResponse(this.popupResponse, value, 'wishlist')
   //                );
   // }

   public selectedCurrency(value) {
      this.embryoService.currency = value;
   }

   public selectedLanguage(value) {
      this.embryoService.language = value;
   }

   public addToCart(value) {
      this.embryoService.addToCart(value, 'wishlist');
   }

   onFocus() {
      this.isFocused = true;
   }
   
   onBlur() {
      setTimeout(() => {
      this.isFocused = false;
     }, 250);
   }

   openProductDetails(product){
      const data = {type : "mainSearch", search : this.searchTerm.search};
      this.router.navigate(['/products', product.categories[0].englishName, product.id],{ queryParams: data});
      this.searchTerm.search = '';
      this.searchControl.reset();
   }

   submit() {
      if(this.searchTerm.search){
         const data = {type : "mainSearch", search : this.searchTerm.search};
         this.router.navigate(['/products',this.searchTerm.search],{ queryParams: data});
         this.searchTerm.search = '';
         this.searchControl.reset();     
       }
  }
  

   ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
}
