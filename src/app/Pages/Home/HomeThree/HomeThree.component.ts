import { Component, OnInit } from '@angular/core';
import { EmbryoService } from '../../../Services/Embryo.service';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-HomeThree',
  templateUrl: './HomeThree.component.html',
  styleUrls: ['./HomeThree.component.scss']
})
export class HomeThreeComponent implements OnInit {


   products : any;
   allProducts : any;
   newProductsSliderData : any;

   categories : any;
   brands: any = [];


   slideConfig = {
      slidesToShow: 4,
      slidesToScroll:2,
      autoplay: true,
      autoplaySpeed: 2000,
      dots: false,
      arrows: true,
      responsive: [
         {
            breakpoint: 992,
            settings: {
               arrows: false,
               slidesToShow: 2,
               slidesToScroll:1
            }
            },
         {
            breakpoint: 768,
            settings: {
               arrows: false,
               slidesToShow: 2,
               slidesToScroll:1
            }
            },
         {
            breakpoint: 480,
            settings: {
               arrows: false,
               slidesToShow: 1,
               slidesToScroll:1
            }
         }
      ]
   };

   rtlSlideConfig = {
      slidesToShow: 4,
      slidesToScroll:1,
      autoplay: true,
      autoplaySpeed: 1500,
      dots: false,
      rtl: true,
      arrows: true,
      responsive: [
         {
            breakpoint: 992,
            settings: {
               arrows: false,
               slidesToShow: 2,
               slidesToScroll:2
            }
            },
         {
            breakpoint: 768,
            settings: {
               arrows: false,
               slidesToShow: 2,
               slidesToScroll:2
            }
            },
         {
            breakpoint: 480,
            settings: {
               arrows: false,
               slidesToShow: 1,
               slidesToScroll:1
            }
         }
      ]
   };

	subscription : any ;


   constructor(public embryoService : EmbryoService,private httpReq : HttpRequestService) { }

   ngOnInit() {
      this.getProducts();
      this.getCategoriesAndBrands();
   }

   public getProducts() {
      var payload = {
         apiName: 'getProductAdmin',
         body: '',
         method: 'POST'
         };
      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .pipe(
         map(res => res)
         )
         .subscribe(
         data => {
            this.getProductsResponse(data.products);
         },
         error => {
            // Handle the subscription error here
            console.error('An error occurred:', error);
         }
         );
   }

   public getCategoriesAndBrands(){
      var payload = {
         apiName: 'getCategoryAndBrands',
         body: '',
         method: 'POST'
         };
      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .pipe(
         map(res => res)
         )
         .subscribe(
         data => {
            this.categories = data.categories;
            this.brands = data.brands;
         },
         error => {
            // Handle the subscription error here
            console.error('An error occurred:', error);
         }
         );
   }

   public getProductsResponse(res) {
      this.products = res;
      this.newProductsSliderData = res;
   }


   public addToCart(value) {
      this.embryoService.addToCart(value);
   }


}
