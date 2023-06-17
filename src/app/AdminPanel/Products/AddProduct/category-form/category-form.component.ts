import { HttpRequestService } from './../../../../Services/httpRequest/http-request.service';
import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { map } from 'rxjs';

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  selectedFile: ImageSnippet;

  url: any; //Angular 11, for stricter type
	msg = "";
  @Input() selectedType;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  subscription;
  loading: boolean = false;

  categoryForm = {englishName:'',arabicName:'',selectedImage:{name:'',url:'',file:''} };


  constructor(private _snackBar: MatSnackBar,private httpReq : HttpRequestService) { }

  ngOnInit(): void {
  }

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();


    reader.addEventListener('load', (event: any) => {

      this.selectedFile = new ImageSnippet(event.target.result, file);

    });

    reader.readAsDataURL(file);
  }

  selectFile(event: any) { //Angular 11, for stricter type
		if(!event.target.files[0] || event.target.files[0].length == 0) {
			this.msg = 'You must select an image';
			return;
		}

		var mimeType = event.target.files[0].type;

		if (mimeType.match(/image\/*/) == null) {
			this.msg = "Only images are supported";
      this.openSnackBar('Only images are supported','error');
			return;
		}

		var reader = new FileReader();
		reader.readAsDataURL(event.target.files[0]);
    const file = event.target.files[0];
		reader.onload = (_event) => {
			this.msg = "";
			this.url = reader.result;
      this.categoryForm.selectedImage ={
        name: file.name,
        url: reader.result as string,
        file: file
      };
		}
  }

  openSnackBar(msg: string, type: string) {
    const panelClass = (type === 'error') ?  'custom-toast-error' :'custom-toast-success';
    this._snackBar.open(msg, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 4000,
      panelClass: panelClass,
    });
  }

  onSubmit(){


    if(this.categoryForm.arabicName == '' || this.categoryForm.englishName == '' || this.categoryForm.selectedImage.file == ''){
      this.openSnackBar('Please fill the fields','error');
      return;
    }


    // Create an instance of FormData
    const formData = new FormData();
    formData.append('selectedImage', this.categoryForm.selectedImage.file, this.categoryForm.selectedImage.name);
    formData.append('arabicName', this.categoryForm.arabicName);
    formData.append('englishName', this.categoryForm.englishName);
    formData.append('categoryType', this.selectedType);

    var payload = {
      apiName: 'addCategory',
      body: formData,
      method: 'POST'
    };
    this.loading = true;

    this.subscription = this.httpReq.makeHttpRequest(payload)
    .pipe(
      map(res => res)
    )
    .subscribe(
      data => {
        // Handle the response data here
        this.loading = false;
        if(data.message == '00000'){
          this.openSnackBar("Category Added succefully","success");
          this.url = '';
          this.categoryForm = {englishName:'',arabicName:'',selectedImage:{name:'',url:'',file:''} };
        }else{
          this.openSnackBar("Something went wrong, please try again","error");
        }

      },
      error => {
        // Handle the subscription error here
        console.error('An error occurred:', error);
        this.loading = false;
        this.openSnackBar("Something went wrong, please try again","error");
      }
    );

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
