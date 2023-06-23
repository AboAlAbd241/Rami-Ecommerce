import { UploadImagesComponent } from './../../../../Global/upload-images/upload-images.component';
import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder ,FormGroup,UntypedFormControl,UntypedFormGroup,ValidatorFn,Validators} from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import Quill from 'quill';
import { QuillTableModule } from 'quill-table';
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
  selectedImages: {id: string, imagePath: String, priority: String}[] = [];

  productForm;

  //toolbar
  @ViewChild('editor') editorElementRef: ElementRef;
  editor: Quill;

  //description
  textDescription = '';
  // des = {header : null , content : null};
  
  //spinner
  loading: boolean = false;

  deletedImagesList = [];
  colorsList = [];
	productDate: any;



  constructor(private cdr: ChangeDetectorRef, 
    private _snackBar: MatSnackBar,private fb: FormBuilder,
    private router : Router, private httpReq : HttpRequestService,
    private activeRoute: ActivatedRoute) {

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
      colors: this.fb.array([]),
      selectedImages:  [[],Validators.required],
    });


  }


  ngOnInit(): void {

    this.activeRoute.queryParams.subscribe(params => {
      if(params && params.images && params.colorsObj){
        this.productDate = params;
        this.selectedImages =  params.images.length > 0 ? JSON.parse(params.images) : [];
        this.colorsList = params.colorsObj.length > 0 ? JSON.parse(params.colorsObj) : [];
      }
    });
  


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
      this.editor = new Quill(this.editorElementRef.nativeElement, {
        theme: 'snow',
        placeholder: 'Enter the description',
        modules: {
          table: true,
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


      if(this.productDate && this.productDate.id){
        this.editor.root.innerHTML = this.productDate.description;

        setTimeout(() => {
    
          this.productForm = this.fb.group({
            productName: [this.productDate.name,Validators.required],
            price: [this.productDate.price ,Validators.required],
            oldPrice: [this.productDate?.oldPrice],
            shortDescription: [this.productDate?.shortDescription],
            stock: [this.productDate.available == 'true' ? true : false],
            brand: [this.productDate?.brand],
            category: [this.productDate.categories,Validators.required],
            isMultipleColor: this.productDate.isMultipleColor == 'true',
            numberOfColor: [this.productDate?.numberOfColor],
            descriptionType:this.fb.control('text'),
            colors: this.productDate.colors.length > 0 ? this.fb.array(this.productDate.colors) : this.fb.array([]),
            selectedImages:  [[],Validators.required],
          });
    
        });
      
      }
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


  setNumberOfColor(event){
    this.productForm.value.colors = [''];
    const resetColor = <FormArray>this.productForm.controls.colors;
    resetColor.controls = [];
    this.addColors()
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
      this.productForm.value.colors=[''];
      this.productForm.value.numberOfColor='';
      this.cdr.detectChanges();
  }

  resetDescription(){

    this.textDescription = '';
    this.cdr.detectChanges();
    this.editor.root.innerHTML = '';

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

  onSubmit(){

    if (!this.selectedImages || this.selectedImages.length == 0) {
      this.openSnackBar('Please select at least one image','error');
      return;
    }
    if (this.productForm.get('productName').value == null || this.productForm.get('productName').value.trim() == '' || this.productForm.get('productName').value == undefined) {
      this.openSnackBar('Please fill the required fields ','error');
      return;
    }
    if (this.productForm.get('price').value == null || this.productForm.get('price').value.trim == '' || this.productForm.get('price').value == undefined) {
      this.openSnackBar('Please fill the required fields ','error');
      return;
    }
    if (this.productForm.get('category').value == null ||this.productForm.get('category').value.trim() == '' || this.productForm.get('category').value == undefined) {
      this.openSnackBar('Please fill the required fields ','error');
      return;
    }
    if (this.productForm.get('isMultipleColor').value == null || this.productForm.get('isMultipleColor').value &&
          (this.productForm.get('numberOfColor').value == null || this.productForm.get('numberOfColor').value == '' ||
              this.productForm.get('numberOfColor').value == undefined)) {
      this.openSnackBar('Please fill the required fields ','error');
      return;
    }


    if((this.textDescription == null || this.textDescription.trim() == '') && this.productForm.value.descriptionType == 'text' ){
      this.openSnackBar('Please fill the Description ','error');
      return;
    }

    for(let i = 0; i < this.colors.length; i++){
      if(this.colorsList && this.colorsList.length > i){
        this.colorsList[i].color = this.colors.value[i]
      }else{
        this.colorsList.push({
          id: "",
          color: this.colors.value[i]
        })
      }
      }

    const requestBody = {
      id: this.productDate && this.productDate.id ? this.productDate.id : '' ,
      productName: this.productForm.value.productName,
      price: this.productForm.value.price,
      oldPrice: this.productForm.value.oldPrice,
      shortDescription: this.productForm.value.shortDescription,
      stock: this.productForm.value.stock,
      brand: this.productForm.value.brand,
      category: this.productForm.value.category,
      textDescription: this.textDescription,
      productImages: this.selectedImages,
      deletedImages: this.deletedImagesList,
      colors: this.productForm.get('isMultipleColor').value ? this.colorsList : [],
      
      };



    var payload = {
      apiName: 'updateProduct',
      body: requestBody,
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

          // if update product
          if(this.productDate && this.productDate.id){
            this.openSnackBar("Product has been Updated succefully","success");
            this.router.navigate(['/admin-panel/products'])
          }else{
            this.openSnackBar("Product has been Added succefully","success");
            this.resetForm();
          }

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
  receiveDeletedImages(deletedImages){
    this.deletedImagesList = deletedImages;
  }

  resetForm(){
          this.uploadImagesComponent.resetImage();
          this.resetDescription();
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
            tableDescription:this.fb.array([]),
            colors: this.fb.array([]),
            selectedImages:  [[],Validators.required],
          });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
