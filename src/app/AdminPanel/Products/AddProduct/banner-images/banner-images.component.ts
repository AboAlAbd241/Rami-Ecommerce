import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';

@Component({
  selector: 'app-banner-images',
  templateUrl: './banner-images.component.html',
  styleUrls: ['./banner-images.component.css']
})
export class BannerImagesComponent implements OnInit {

  selectedImages: { id: string, imagePath: string, priority: any, textSearch: string, banner : true }[] = [];
  deletedImagesList = [];


    //toast
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  loading = false;

  subscription;



  constructor(private httpReq : HttpRequestService,
    private _snackBar: MatSnackBar,private router : Router) {
     }

  ngOnInit(): void {
    this.loading = true;


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
        this.loading = false;
        this.selectedImages = data.banners;
        
      },
      error => {
        this.loading = false;
        // Handle the subscription error here
        console.error('An error occurred:', error);
        this.openSnackBar('Something went wrong','error');
      }
    );

  }

  receiveImages(images){
    this.selectedImages = images;
  }
  receiveDeletedImages(deletedImages){
    this.deletedImagesList = deletedImages;
  }

  openSnackBar(msg: string, type: string) {
    const panelClass = (type === 'error') ?  'custom-toast-error' :'custom-toast-success';
    this._snackBar.open(msg, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000,
      panelClass: panelClass,
    });
  }

  submitImages() {
    // Perform necessary operations with the selectedImages array
  
    // Show a success message to the user
 
    this.selectedImages.map(item => {
      item.banner = true;
    })
    
    let request = {
      productImages : this.selectedImages,
      deletedImages : this.deletedImagesList,
    }

    this.loading = true;

    var payload = {
      apiName: 'updateBanner',
      body: request,
      method: 'POST'
    };

    this.subscription = this.httpReq.makeHttpRequest(payload)
    .pipe(
      map(res => res)
    )
    .subscribe(
      data => {
        this.loading = false;
       
        this.openSnackBar('The banners have been added succefully','success');
        
      },
      error => {
        this.loading = false;
        // Handle the subscription error here
        console.error('An error occurred:', error);
        this.openSnackBar('Something went wrong','error');
      }
    );

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
