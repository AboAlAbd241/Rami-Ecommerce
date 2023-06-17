import { UploadImagesComponent } from './../../../../Global/upload-images/upload-images.component';
import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder ,FormGroup,UntypedFormControl,UntypedFormGroup,ValidatorFn,Validators} from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Quill from 'quill';

import 'quill/dist/quill.snow.css';
import { map } from 'rxjs/operators';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit, AfterViewInit {

  @Input() selectedType;
  @ViewChild('uploadImage', { static: false }) uploadImagesComponent: UploadImagesComponent;

  //toast
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  subscription : any ;

  brandType;
  categoryType;

  supportedImageFlag = false;
  selectedImages: {name: string, url: String, file: any}[] = [];

  productForm;

  //toolbar
  @ViewChild('editor') editorElementRef: ElementRef;
  editor: Quill;

  //description
  textDescription = '';
  des = {header : null , content : null};
  
  //spinner
  loading: boolean = false;




  constructor(private cdr: ChangeDetectorRef, private _snackBar: MatSnackBar,private fb: FormBuilder,private router : Router, private httpReq : HttpRequestService) {

    this.productForm = this.fb.group({
      productName: ['',Validators.required],
      price: ['' ,Validators.required],
      oldPrice: [''],
      shortDescription: [''],
      stock: [true],
      brand: ['' ],
      category: ['',Validators.required],
      isMultipleColor: [false],
      numberOfColor: [''],
      descriptionType:this.fb.control('text'),
      tableDescription:this.fb.array([]),
      colors: this.fb.array([]),
      selectedImages:  [[],Validators.required],
    });


  }


  ngOnInit(): void {
    var payload = {
      apiName: 'getCategory',
      body: '',
      method: 'POST'
    };

    this.subscription = this.httpReq.makeHttpRequest(payload)
    .pipe(
      map(res => res)
    )
    .subscribe(
      data => {
        this.categoryType = [];
        this.brandType = [];

        //get category
        for(const categorey of data.categories){
          this.categoryType.push({value : categorey.englishName, id : categorey.id })
        }

        //get Brands
        for(const brand of data.brands){
          this.brandType.push({value : brand.englishName, id : brand.id })
        }
      },
      error => {
        // Handle the subscription error here
        console.error('An error occurred:', error);
      }
    );

    const selectedImagesControl = this.productForm.get('selectedImages');
    selectedImagesControl.setValue(this.selectedImages);

  }

  ngAfterViewInit() {
    if (this.productForm.value.descriptionType === 'text') {
      this.editor = new Quill(this.editorElementRef.nativeElement, {
        theme: 'snow',
        placeholder: 'Enter the description',
        modules: {
          toolbar: {
            container: '#toolbar',
            handlers: {
              // Define custom handlers if needed
            },
          },
        },
      });
      this.editor.on('text-change', () => {
        this.textDescription = this.editor.root.innerHTML;
      });
    }


  }

  openSnackBar(msg: string, type: string) {
    const panelClass = (type === 'error') ?  'custom-toast-error' :'custom-toast-success';
    this._snackBar.open(msg, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: panelClass,
    });
  }

  formatTable(){

    if(this.des.header === '' || this.des.header == null || this.des.content === '' || this.des.content == null){
      this.openSnackBar('Please fill the fields of the table to be added','error');
      return;
    }
    this.loadTableArray();
    this.des = {header : null , content : null};
    this.openSnackBar('One row added successfully','success');

  }

  setNumberOfColor(event){
    this.productForm.value.colors = [''];
    const resetColor = <FormArray>this.productForm.controls.colors;
    resetColor.controls = [];
    this.addColors()
  }

  createTableFormGroup() {
    return this.fb.group({
      header: [this.des.header, [Validators.required,Validators.minLength(5)]],
      content: [this.des.content, [Validators.required,Validators.minLength(5)]],
    });
  }

  loadTableArray() {
    let test = this.productForm.get('tableDescription') as FormArray;
    test.push(this.createTableFormGroup());
  }


  get colors(){
    return this.productForm.get('colors') as FormArray;
  }


  addColors(){
    if(parseInt(this.productForm.value.numberOfColor) < 50){
        for(let i = 0; i< parseInt(this.productForm.value.numberOfColor) ; i++)
          this.colors.push(this.fb.control('#000000'));
    }
    else if(parseInt(this.productForm.value.numberOfColor) < 0){
      this.numberOfColor.setErrors({'incorrect': true});
    }else{
      this.numberOfColor.setErrors({'incorrect': true});
    }
  }

  get numberOfColor(){
    return this.productForm.get('numberOfColor') as FormGroup
  }

  format(str){
    if(str){
      return JSON.stringify(str);
    }
  }

  radioChange(){
    // if(!this.productForm.value.isMultipleColor)
      this.productForm.value.colors=[''];
      this.productForm.value.numberOfColor='';
      this.cdr.detectChanges();
  }

  resetDescription(){

    this.des = {header : null, content : null};
    this.textDescription = '';
    this.productForm.get('tableDescription').clear();
    this.cdr.detectChanges();

    if(this.productForm.value.descriptionType == 'text'){
      this.editor = new Quill(this.editorElementRef.nativeElement, {
        theme: 'snow',
        placeholder: 'Enter your text...',
        modules: {
          toolbar: {
            container: '#toolbar',
            handlers: {
              // Define custom handlers if needed
            },
          },
        },
      });

      this.editor.on('text-change', () => {
        this.textDescription = this.editor.root.innerHTML;
      });

    }

  }

  onSubmit(){

    if (this.productForm.get('selectedImages').value.length == 0) {
      this.openSnackBar('Please select at least one image','error');
      return;
    }
    if (this.productForm.get('productName').value == null || this.productForm.get('productName').value.trim == '' || this.productForm.get('productName').value == undefined) {
      this.openSnackBar('Please fill the required fields ','error');
      return;
    }
    if (this.productForm.get('price').value == null || this.productForm.get('price').value.trim == '' || this.productForm.get('price').value == undefined) {
      this.openSnackBar('Please fill the required fields ','error');
      return;
    }
    if (this.productForm.get('category').value == null ||this.productForm.get('category').value.trim == '' || this.productForm.get('category').value == undefined) {
      this.openSnackBar('Please fill the required fields ','error');
      return;
    }
    if (this.productForm.get('isMultipleColor').value &&
          (this.productForm.get('numberOfColor').value == null || this.productForm.get('numberOfColor').value.trim == '' ||
              this.productForm.get('numberOfColor').value == undefined)) {
      this.openSnackBar('Please fill the required fields ','error');
      return;
    }


    if((this.textDescription == null || this.textDescription.trim() == '') && this.productForm.value.descriptionType == 'text' ){
      this.openSnackBar('Please fill the Description ','error');
      return;
    }

    if(this.productForm.value.tableDescription.length == 0  && this.productForm.value.descriptionType == 'table' ){
      this.openSnackBar('Please fill the Description ','error');
      return;
    }


    // Create an instance of FormData
    const formData = new FormData();

    // Append the form data to the FormData object
    formData.append('productName', this.productForm.value.productName);
    formData.append('price', this.productForm.value.price);
    formData.append('oldPrice', this.productForm.value.oldPrice);
    formData.append('shortDescription', this.productForm.value.shortDescription);
    formData.append('stock', this.productForm.value.stock);
    formData.append('brand', this.productForm.value.brand);
    formData.append('category', this.productForm.value.category);
    formData.append('isMultipleColor', this.productForm.value.isMultipleColor);
    formData.append('numberOfColor', this.productForm.value.numberOfColor);
    formData.append('descriptionType', this.productForm.value.descriptionType);
    formData.append('textDescription', this.textDescription);
    for (let i = 0; i < this.productForm.value.tableDescription.length; i++) {
      formData.append('tableDescription', JSON.stringify(this.productForm.value.tableDescription[i]));
    }


    for (let i = 0; i < this.selectedImages.length; i++) {
      const image = this.selectedImages[i];
      formData.append('selectedImages', image.file, image.name);
    }
    for (let i = 0; i < this.productForm.value.colors.length; i++) {
      const color = this.productForm.value.colors[i];
      formData.append('colors', color);
    }
    var payload = {
      apiName: 'addProduct',
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
        this.loading = false;
        if(data.message == '00000'){
          this.openSnackBar("Product has been Added succefully","success");
          this.productForm.reset();
          this.uploadImagesComponent.resetImage();
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

  updateTextDescription(event: any) {
    this.textDescription = event.editor.root.innerHTML;
  }

  receiveImages(images){
    this.productForm.get('selectedImages').setValue(images);
    this.selectedImages = images;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
