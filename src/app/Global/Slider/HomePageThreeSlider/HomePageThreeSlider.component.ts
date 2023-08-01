import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { map } from 'rxjs';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';

@Component({
  selector: 'embryo-HomePageThreeSlider',
  templateUrl: './HomePageThreeSlider.component.html',
  styleUrls: ['./HomePageThreeSlider.component.scss']
})
export class HomePageThreeSliderComponent implements OnInit, OnChanges {

   
   @Input() isRTL : boolean = true;

   slideConfig : any;
   subscription;


   slides : any[] = [];

   constructor(private httpReq : HttpRequestService) { }

   ngOnInit() {
      this.getBanners();
   }

   ngOnChanges() {
      this.slideConfig = {
         infinite: true,
         slidesToShow: 1,
         slidesToScroll: 1,
         autoplay: true,
         autoplaySpeed: 2000,
         dots: false,
         rtl: this.isRTL,
         arrows: true, 
         responsive: [
            {
               breakpoint: 991,
               settings: {
                  arrows: true,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            },
            {
               breakpoint: 768,
               settings: {
                  arrows: true,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            },
            {
               breakpoint: 480,
               settings: {
                  arrows: true,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            }
         ]
      };
   }

   getBanners(){
      var payload = {
         apiName: 'getBanners',
         body: '',
         method: 'POST'
       };
   
       this.subscription = this.httpReq.makeHttpRequest(payload)
       .pipe(
         map(res => res)
       )
       .subscribe(
         data => {
            data.banners.sort((a, b) => a.priority - b.priority);
            data.banners.forEach(element => {
               this.slides.push({img: element.imagePath})
            });
           
         },
         error => {
           // Handle the subscription error here
           console.error('An error occurred:', error);
         }
       );
   }

}
