import { filter } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'embryo-ProductCard',
  templateUrl: './ProductCard.component.html',
  styleUrls: ['./ProductCard.component.scss']
})
export class ProductCardComponent implements OnInit {

   @Input() product : any;

   @Input() index   : any;

   @Input() currency : string;

   @Input() type  : string = '';

   @Output() addToCart: EventEmitter<any> = new EventEmitter();

   @Output() addToWishlist: EventEmitter<any> = new EventEmitter();

   constructor(private router: Router) { }

   ngOnInit() {
      this.formatProduct();
   }

   public addToCartProduct(value:any) {
      this.addToCart.emit(value);
   }

   public productAddToWishlist(value:any, parentClass) {
      if(!(document.getElementById(parentClass).classList.contains('wishlist-active'))){
         let element = document.getElementById(parentClass).className += " wishlist-active";
      }
      this.addToWishlist.emit(value);
   }

   // public checkCartAlready(singleProduct) {
   //    let products = JSON.parse(localStorage.getItem("cart_item")) || [];
   //    if (!products.some((item) => item.id == singleProduct.id)) {
   //       return true;
   //    }
   // }

   formatProduct(){
      if(this.product.images.length > 1){
         let secondImage = this.product.thumbnailsImage;
         secondImage = secondImage.split('/');
         secondImage.pop(); // Remove the last element (image name)
         let newPath = secondImage.join('/');
   
   
         let secondThumbnailsImage = this.product.images.filter(item =>{
            return item.priority == 1;
         })
   
   
         this.product.secondThumbnailsImage = newPath + '/' + secondThumbnailsImage[0].imagePath.split('/').pop();
      }
   }

   openProductDetails(product){
      const data = {categoryId : product?.categories[0]?.id};
      this.router.navigate(['/products',product?.categories[0]?.englishName,product?.id],{ queryParams: data});
   }

}
