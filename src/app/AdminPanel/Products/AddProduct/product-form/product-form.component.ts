import { UploadImagesComponent } from './../../../../Global/upload-images/upload-images.component';
import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { FormArray, FormBuilder ,FormGroup,UntypedFormControl,UntypedFormGroup,ValidationErrors,ValidatorFn,Validators} from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
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
  selectedImages: {id: string, imagePath: String, priority: String}[] = [];

  productForm;

  //toolbar
  @ViewChild('editor') editorElementRef: ElementRef;
  editor: Quill;

  //description
  textDescription = '';
  
  //spinner
  loading: boolean = false;

  deletedImagesList = [];
  colorsList = [];
  storageOptionsList = [];
  productFeaturesList = [];
	productDate: any;

  specificationsArray;



  constructor(private cdr: ChangeDetectorRef, 
    private _snackBar: MatSnackBar,private fb: FormBuilder,
    private router : Router, private httpReq : HttpRequestService,
    private activeRoute: ActivatedRoute) {

      this.productForm = this.fb.group({
        productName: ['',Validators.required],
        price: ['' ,Validators.required],
        oldPrice: [''],
        search: ['',Validators.required],
        quantityInInventory: ['',Validators.required],
        productCode: [''],
        stock: [true],
        brand: ['' ],
        category: ['',Validators.required],
        hasMultipleColors: [false], 
        selectedImages:  [[]],
        hasMultipleStorage: [false], 
        storage: this.fb.array([]), 
        ourChoice: [false],
        newArrival: [false],
        bestSeller: [false],
        categoryFeatures: this.fb.array([]), 
        colors: this.fb.array([]),
        specifications: this.fb.array([]),
  });


  }




  ngOnInit(): void {

    this.activeRoute.queryParams.subscribe(params => {
      if(params && params.images && params.colorsObj){
        this.productDate = params;
        this.selectedImages =  params.images.length > 0 ? JSON.parse(params.images) : [];
        this.colorsList = params.colorsObj.length > 0 ? JSON.parse(params.colorsObj) : [];
        this.productFeaturesList = params.productFeatures && params.productFeatures.length > 0 ? JSON.parse(params.productFeatures) : [];
        this.storageOptionsList = params.storageOptions && params.storageOptions.length > 0 ? JSON.parse(params.storageOptions) : [];
        if(params.specifications){
          this.specificationsArray = JSON.parse(params.specifications);
        }
      }
    });


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
        this.categoryType = [];
        this.brandType = [];

        //get category
        for(const categorey of data.categories){
          this.categoryType.push({value : categorey.englishName, id : categorey.id, features: categorey.features });
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
            search: [this.productDate?.search,Validators.required],
            quantityInInventory: [this.productDate?.quantityInInventory,Validators.required],
            productCode: [this.productDate?.productCode],
            stock: [this.productDate.available == 'true' ? true : false],
            brand: [this.productDate?.brand],
            category: [this.productDate.categories,Validators.required],
            hasMultipleColors: this.productDate?.hasMultipleColors == 'true', 
            descriptionType:this.fb.control('text'),
            colors:  this.fb.array([]),
            selectedImages:  [[]],
            hasMultipleStorage: [false], 
            storage: this.fb.array([]),  
            ourChoice: [this.productDate.ourChoice == 'true'],
            newArrival: [this.productDate.newArrival == 'true'],
            bestSeller: [this.productDate.bestSeller == 'true'],
            categoryFeatures: this.fb.array([]),
            specifications: this.fb.array([]),

            
          });
    
          this.updateProductFeature(this.productFeaturesList);
          this.updateStorage(this.storageOptionsList);
          this.updateColors(this.colorsList);

          if(this.specificationsArray){
            this.setSpecifications(this.specificationsArray);
          }

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

  addColors() {
    const colorGroup = this.fb.group({
      colorId: [''], 
      color: ['#000000', Validators.required],
      colorAvailableInStock: [true]
    });
    this.colors.push(colorGroup);
  }

  removeColor(index: number) {
    this.colors.removeAt(index);
  }

  // addColors() {
  //   const numberOfColors = parseInt(this.productForm.value.numberOfColor);
  
  //   if (numberOfColors > 0 && numberOfColors < 11) {
  //     const colorsFormArray: FormGroup[] = [];
  
  //     for (let i = 0; i < numberOfColors; i++) {
  //       const colorFormGroup = this.fb.group({
  //         color: [ '#000000' ],
  //         colorAvailableInStock: [ true ],
  //       });
  
  //       colorsFormArray.push(colorFormGroup);
  //     }
  
  //     this.productForm.setControl('colors', this.fb.array(colorsFormArray));
  //   } else {
  //     this.numberOfColor.setErrors({ 'incorrect': true });
  //   }
  // }
  

  get numberOfColor(){
    return this.productForm.get('numberOfColor') as FormGroup
  }

  get storage(): FormArray {
    return this.productForm.get('storage') as FormArray;
}

addStorage() {
    const storageGroup = this.fb.group({
        storageSize: ['', Validators.required],
        price: ['', Validators.required],
        oldPrice:[''],
        available:[true, Validators.required],
        id: ['']
    });

    this.storage.push(storageGroup);
}

removeStorage(index: number) {
  this.storage.removeAt(index);
}

//for Update Product
updateStorage(data) {

  if(data && data.length > 0){
    data.forEach(item =>{

      const storageGroup = this.fb.group({
        storageSize: [item.storageSize, Validators.required],
        price: [item.price, Validators.required],
        oldPrice:[item.oldPrice],
        available:[item.available, Validators.required],
        id: [item.id]
    });

    this.storage.push(storageGroup);
    
  });
  this.productForm.get('hasMultipleStorage').setValue(true); 
  this.cdr.detectChanges();
  }
}

//for Update colors
updateColors(data) {

  if(data && data.length > 0){
    data.forEach(item =>{
      const colorFormGroup = this.fb.group({
        colorId: [item.id],
        color: [ item.color ],
        colorAvailableInStock: [ item.available ],
      });


    this.colors.push(colorFormGroup);
    
  });
  this.productForm.get('hasMultipleColors').setValue(true); 
  this.cdr.detectChanges();
  }
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
    // if (this.productForm.get('hasMultipleColors').value == null || this.productForm.get('hasMultipleColors').value &&
    //       (this.productForm.get('colors').value == null || this.productForm.get('colors').value == '' ||
    //           this.productForm.get('colors').value == undefined)) {
    //   this.openSnackBar('Please fill the required fields ','error');
    //   return;
    // }


    if((this.textDescription == null || this.textDescription.trim() == '') && this.productForm.value.descriptionType == 'text' ){
      this.openSnackBar('Please fill the Description ','error');
      return;
    }

    if (this.productForm.invalid) {
      this.logValidationErrors(this.productForm);
      this.openSnackBar('Please Fill the fields','error');
      return;
    }

    this.colorsList = [];
    for(let i = 0; i < this.colors?.length; i++){
        this.colorsList.push({
          id: this.colors.value[i].colorId,
          color: this.colors.value[i].color,
          available: this.colors.value[i].colorAvailableInStock,
        })
      }


      // to set the product out of stock in case color or storage are unavailable
      if(this.productForm.value.stock){
        let removeAvailable = true;

        if(this.productForm.value.hasMultipleStorage && this.productForm.value.storage.length > 0){
          this.productForm.value.storage.forEach(element => {
            if(element.available == true){
              removeAvailable = false;
            }
            
          });
          if(removeAvailable){
            this.productForm.value.stock = false;
          }
        }

        removeAvailable = true;
        if(this.productForm.value.hasMultipleColors && this.colorsList.length > 0){
          this.colorsList.forEach(element => {
            if(element.available == true){
              removeAvailable = false;
            }
            
          });
          if(removeAvailable){
            this.productForm.value.stock = false;
          }
        }


      }

      //remove availabel from colors or storage in case the product not available
      if(!this.productForm.value.stock){
        if(this.productForm.value.hasMultipleStorage && this.productForm.value.storage.length > 0){
          this.productForm.value.storage.forEach(element => {
            if(element.available == true){
              element.available = false;
            }
            
          });
        }
        if(this.productForm.value.hasMultipleColors && this.colorsList.length > 0){
          this.colorsList.forEach(element => {
            if(element.available == true){
              element.available = false;
            }
            
          });
        }
      }

    const requestBody = {
      id: this.productDate && this.productDate.id ? this.productDate.id : '' ,
      productName: this.productForm.value.productName,
      price: this.productForm.value.price,
      oldPrice: this.productForm.value.oldPrice,
      search: this.productForm.value.search,
      productCode: this.productForm.value.productCode,
      quantityInInventory: this.productForm.value.quantityInInventory,
      stock: this.productForm.value.stock,
      brand: this.productForm.value.brand,
      category: this.productForm.value.category,
      textDescription: this.textDescription,
      productImages: this.selectedImages,
      deletedImages: this.deletedImagesList,
      colors: this.productForm.get('hasMultipleColors').value ? this.colorsList : [],
      storageOptions: this.productForm.value.hasMultipleStorage ? this.productForm.value.storage : [],
      ourChoice: this.productForm.value.ourChoice,
      newArrival: this.productForm.value.newArrival,
      bestSeller: this.productForm.value.bestSeller,
      productFeatures: this.productForm.value.categoryFeatures,
      specifications: this.productForm.value.specifications ? JSON.stringify(this.productForm.value.specifications) : '',
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
            search: ['',Validators.required],
            quantityInInventory: ['',Validators.required],
            productCode: [''],
            stock: [true],
            brand: ['' ],
            category: ['',Validators.required],
            hasMultipleColors: [false], 
            colors: this.fb.array([]),
            selectedImages:  [[]],
            hasMultipleStorage: [false], // Add this line
            storage: this.fb.array([]),  // And this line
            ourChoice: [false],
            newArrival: [false],
            bestSeller: [false],
            categoryFeatures: this.fb.array([]),
            specifications: this.fb.array([]),
          });
  }

  //this method for update product
  updateProductFeature(data){

    const categoryFeatures = this.productForm.get('categoryFeatures') as FormArray;
    categoryFeatures.clear();
    if(data && data.length > 0){
      data.forEach(feature => {
        let formGroup = this.fb.group({
          categoryFeatureId: feature.categoryFeatureId,
          key: feature.key,
          values: [feature.values],
          value: feature.value, // This will hold the selected value

        });
        categoryFeatures.push(formGroup);
      });
    }
    this.cdr.detectChanges();

  }


  onCategoryChange(event) {
    let features = this.categoryType.filter(item => {
      if(item.id == event.value){
        return item.features;
      }
    });
  
    const categoryFeatures = this.productForm.get('categoryFeatures') as FormArray;
    categoryFeatures.clear();
    if(features[0]){
      features[0].features.forEach(feature => {
        let formGroup = this.fb.group({
          categoryFeatureId: feature.id,
          key: feature.key,
          values: [feature.values],
          value: '', // This will hold the selected value

        });
        categoryFeatures.push(formGroup);
      });
    }
    this.cdr.detectChanges();
  }


  get specifications(): FormArray {
    return this.productForm.get('specifications') as FormArray;
  }
  
  addSpecification() {
    const specification = this.fb.group({
      header: ['', Validators.required],
      keyValuePairs: this.fb.array([this.createKeyValuePair()])
    });
    
    this.specifications.push(specification);
  }
  
  createKeyValuePair(): FormGroup {
    return this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    });
  }
  
  addKeyValuePair(specification: FormGroup) {
    const keyValuePairs = specification.get('keyValuePairs') as FormArray;
    keyValuePairs.push(this.createKeyValuePair());
  }
  
  removeKeyValuePair(specification: FormGroup, index: number) {
    const keyValuePairs = specification.get('keyValuePairs') as FormArray;
    keyValuePairs.removeAt(index);
  }
  
  removeSpecification(index: number) {
    this.specifications.removeAt(index);
  }

  setSpecifications(specificationsData: any[]) {
    const specificationsFormGroups = specificationsData.map(spec => {
        return this.fb.group({
            header: spec.header,
            keyValuePairs: this.fb.array(spec.keyValuePairs.map(kv => {
                return this.fb.group({
                    key: kv.key,
                    value: kv.value
                });
            }))
        });
    });

    const newFormArray = this.fb.array(specificationsFormGroups);
    this.productForm.setControl('specifications', newFormArray);
}


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  logValidationErrors(group: FormGroup | FormArray): void {
    Object.keys(group.controls).forEach((key: string) => {
        const abstractControl = group.controls[key];
        
        if (abstractControl instanceof FormGroup || abstractControl instanceof FormArray) {
            this.logValidationErrors(abstractControl);
        } else {
            if (abstractControl.errors) {
                Object.keys(abstractControl.errors).forEach(errorKey => {
                    console.log('Control: ', key, 'Error Type:', errorKey, 'Error Value:', abstractControl.errors[errorKey]);
                });
            }
        }
    });
}
}
