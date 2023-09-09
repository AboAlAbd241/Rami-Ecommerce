import { Component, OnInit, Input, OnChanges, Renderer2, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { Router, ActivatedRoute, Params }   from '@angular/router';

import {EmbryoService } from '../../Services/Embryo.service';

@Component({
  selector: 'embryo-ShopDetails',
  templateUrl: './ShopDetails.component.html',
  styleUrls: ['./ShopDetails.component.scss']
})
export class ShopDetailsComponent implements OnInit, OnChanges, AfterViewInit  {

   @Input() detailData : any;
   @Input() currency   : string;

   mainImgPath   : string;
   totalPrice    : any;
   type          : any;
   colorsArray   : string[] = ["Red", "Blue", "Yellow", "Green"];
   sizeArray     : number[] = [36,38,40,42,44,46,48];
   quantityArray : number[] = [1,2,3,4,5,6,7,8,9,10];
   productReviews : any;

   selectedQuantity: number = 1;
   selectedColor  : any = null;
   selectedStorage: any = null;
   displayedColumns: string[] = ['key', 'value'];

   isLongDescription = true;

   activeThumbnail = 0;

   @ViewChild('description', { static: false }) description: ElementRef;

   constructor(private route: ActivatedRoute,
               private router: Router, 
               public embryoService : EmbryoService,
               private cdRef: ChangeDetectorRef
               ) {
      this.embryoService.getProductReviews().valueChanges().subscribe(res => {this.productReviews = res});
   }

   ngOnInit() {
      try{
         this.detailData.specifications = this.detailData?.specifications && this.detailData?.specifications != '' && JSON?.parse(this.detailData?.specifications) ? JSON.parse(this.detailData.specifications)  : null;
      }catch(e){

      }
      // this.mainImgPath = this.detailData.image;
      this.totalPrice  = this.detailData.price; 

      this.detailData.images.forEach(element => {
         if(element.priority == 0){
            this.mainImgPath = element?.imagePath;
         }
      });

      this.setDefaultValueForColorsAndStorage();

      this.route.params.subscribe(res => {
         this.type = null;
         this.type = res.type; 
      });
   }

   ngOnChanges() {
      this.totalPrice  = this.detailData.price; 
      this.detailData.images.forEach(element => {
         if(element.priority == 0){
            this.mainImgPath = element?.imagePath;
         }
      });

      this.setDefaultValueForColorsAndStorage();

      this.detailData.specifications = this.detailData?.specifications && JSON?.parse(this.detailData?.specifications) ? JSON.parse(this.detailData.specifications)  : null;

   }

   ngAfterViewInit() {
      const descElement = this.description.nativeElement;
  
      if (descElement.scrollHeight > descElement.clientHeight) {
        // The description has more than three lines.
        descElement.style.display = 'none';
        this.isLongDescription = false; // Set to false to hide the long description and show the shorter one
        this.cdRef.detectChanges(); // Trigger change detection to update the view
      }
    }

   /**
    * getImagePath is used to change the image path on click event. 
    */
   public getImagePath(imgPath: any, index:number) {
      document.querySelector('.border-active').classList.remove('border-active');
      this.mainImgPath = imgPath?.imagePath;
      document.getElementById(index+'_img').className += " border-active";
   }

   public calculatePrice(detailData:any, value: any) {
      detailData.quantity = value;
      this.totalPrice = detailData.price*value;
   }

   // public reviewPopup(detailData) {
   //    let reviews : any = null;
   //    for(let review of this.productReviews) {
   //      reviews = review.user_rating;
   //    }

   //    this.embryoService.reviewPopup(detailData, reviews);
   // }

   // public addToWishlist(value:any) {
   //    this.embryoService.addToWishlist(value);
   // }

   public addToCart(value:any) {
      value.quantity = this.selectedQuantity;
      value.selectedColor = this.selectedColor ? this.selectedColor : null ;
      value.selectedStorage = this.selectedStorage ? this.selectedStorage : null;
      value.invoiceId =  Date.now().toString();

      this.embryoService.addToCart(value);
   }

   public buyNow(value:any) {
      value.quantity = this.selectedQuantity;
      value.selectedColor = this.selectedColor ? this.selectedColor : null ;
      value.selectedStorage = this.selectedStorage ? this.selectedStorage : null;
      value.invoiceId =  Date.now().toString();
      
      this.embryoService.buyNow(value);
      this.router.navigate(['/checkout']);
   }

   changeMainImage(imagePath: string, index: number) {
      this.mainImgPath = imagePath;
      this.activeThumbnail = index;
    }

    decreaseQuantity() {
      if (this.selectedQuantity > 1) {
        this.selectedQuantity--;
        this.calculatePrice(this.detailData, this.selectedQuantity);
      }
    }
  
    increaseQuantity() {
      // if (this.selectedQuantity < this.quantityArray[this.quantityArray.length - 1]) {
        this.selectedQuantity++;
        this.calculatePrice(this.detailData, this.selectedQuantity);
      // }
    }

    selectColor(color: string) {
      this.selectedColor = color;
    }

    selectStorage(storageOption: any) {
      this.selectedStorage = storageOption;
      this.totalPrice = storageOption?.price;
      this.detailData.price = storageOption?.price;
      this.detailData.oldPrice = storageOption?.oldPrice;
      this.selectedQuantity = 1;
    }

    setDefaultValueForColorsAndStorage(){

            //for color default selection
            if (this.detailData.productColors && this.detailData.productColors.length > 0) {
               for (const element of this.detailData.productColors) {
                  if (element.available) {
                     this.selectedColor = element;
                     break;
                  }
               }
             }
      
             //for storage default selection
             if (this.detailData.storageOptions && this.detailData.storageOptions.length > 0) {
               this.detailData.oldPrice = null;
               for (const element of this.detailData.storageOptions) {
                  if (element.available) {
                     this.selectedStorage = element;
                     this.totalPrice = element.price;
                     this.detailData.price =  element.price;
                     this.detailData.oldPrice = element.oldPrice;
                     break;
                  }
               }
             }

    }
}


