import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params }   from '@angular/router';
import { EmbryoService } from '../../../Services/Embryo.service';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-DetailPage',
  templateUrl: './DetailPage.component.html',
  styleUrls: ['./DetailPage.component.scss']
})
export class DetailPageComponent implements OnInit {

   id                : any;
   type              : any;
   apiResponse       : any;
   singleProductData : any;
   productsList      : any;
   subscription      : any;
   categoryId        : any;

   constructor(private route: ActivatedRoute,
              private router: Router,
              public embryoService: EmbryoService,
              private httpReq : HttpRequestService) {
      
   }

   ngOnInit() {
      this.route.params.subscribe(res => {
         this.id = res.id;
         this.type = res.type;
         this.getData();
      })

      this.route.queryParams.forEach(queryParams => {
         this.categoryId = queryParams.categoryId;
      });
   }

   public getData() {
      // this.embryoService.getProducts().valueChanges().subscribe(res => this.checkResponse(res));

      let req = {"id": this.id};

      var payload = {
         apiName: 'getProductById',
         body: req,
         method: 'POST'
         };
      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .pipe(
         map(res => res)
         )
         .subscribe(
         data => {
            this.singleProductData = data.product;
            this.getproductsByCategory()
         },
         error => {
            // Handle the subscription error here
            console.error('An error occurred:', error);
         }
         );
   }

   public getproductsByCategory(){

      let body = {size: 4, page : 0, categoryId: this.categoryId, productId : this.singleProductData.id};
      var payload = {
         apiName: 'getProductByTextSearch',
         body: body,
         method: 'POST'
         };
      
         this.subscription = this.httpReq.makeHttpRequest(payload)
         .pipe(
         map(res => res)
         )
         .subscribe(
         data => {
            this.productsList = data.products;
            this.formatProduct();
         },
         error => {
            // Handle the subscription error here
            console.error('An error occurred:', error);
         }
         );
   }

   public checkResponse(response) {
      this.productsList = null;
      this.productsList = response[this.type];
      for(let data of this.productsList)
      {
         if(data.id == this.id) {
            this.singleProductData = data;
            break;
         }
      }
   }

   public addToCart(value) {
      this.embryoService.addToCart(value);
   }

   public addToWishList(value) {
      this.embryoService.addToWishlist(value);
   }

   formatProduct(){

      this.productsList?.forEach(product => {
         
         if(product?.images?.length > 1){
            let secondImage = product.thumbnailsImage;
            secondImage = secondImage.split('/');
            secondImage.pop(); // Remove the last element (image name)
            let newPath = secondImage.join('/');
      
      
            let secondThumbnailsImage = product.images.filter(item =>{
               return item.priority == 1;
            })
      
      
            product.secondThumbnailsImage = newPath + '/' + secondThumbnailsImage[0].imagePath.split('/').pop();
         }
      });
      
   }

   ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
}
