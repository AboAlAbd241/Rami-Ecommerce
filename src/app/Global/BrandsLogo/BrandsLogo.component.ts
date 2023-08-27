import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { EmbryoService } from '../../Services/Embryo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'embryo-BrandsLogo',
  templateUrl: './BrandsLogo.component.html',
  styleUrls: ['./BrandsLogo.component.scss']
})
export class BrandslogoComponent implements OnInit, OnChanges {

   @Input() isRTL : any;

   slideConfig : any;

   @Input() brandsLogoArray : any;

   constructor(public embryoService : EmbryoService, private router: Router) { }

   ngOnInit() {
   }

   ngOnChanges() {
      this.slideConfig = {
         infinite: true,
         centerMode: true,
         slidesToShow: 5,
         slidesToScroll: 2,
         autoplay: true,
         autoplaySpeed: 2000,
         rtl: this.isRTL,
         responsive: [
            {
               breakpoint: 768,
               settings: {
                  centerMode: true,
                  slidesToShow: 4,
                  slidesToScroll: 2,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            },
            {
               breakpoint: 480,
               settings: {
                  centerMode: true,
                  slidesToShow: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            }
         ]
      };
   }

   

   public openProductList(brand){
      const data = {type : "brandSearch", id : brand.id};
      this.router.navigate(['/products',brand.englishName],{ queryParams: data});
   }

}
