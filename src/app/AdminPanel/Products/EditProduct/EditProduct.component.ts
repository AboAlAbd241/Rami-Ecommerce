import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder ,FormGroup,UntypedFormControl,UntypedFormGroup,ValidatorFn,Validators} from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import Quill from 'quill';

import 'quill/dist/quill.snow.css';
import { map } from 'rxjs/operators';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';

@Component({
	selector: 'app-edit-product',
	templateUrl: './EditProduct.component.html',
	styleUrls: ['./EditProduct.component.scss']
})

export class EditProductComponent implements OnInit {

  
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

	productDate: any;

	imagesList = [];
	colorsList = [];
	deletedImagesList = [];
	dragIndex: number | null = null;
  
  
  
  
	constructor(private cdr: ChangeDetectorRef, 
	  private _snackBar: MatSnackBar,private fb: FormBuilder,
	  private router : Router,private activeRoute: ActivatedRoute, private httpReq : HttpRequestService) {
  
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
		colors: this.fb.array([]),
		selectedImages:  [[],Validators.required],
	  });
  
  
	}
  
  
	ngOnInit(): void {

	this.activeRoute.queryParams.subscribe(params => {
		this.productDate = params;
		this.imagesList =  params.images.length > 0 ? JSON.parse(params.images) : [];
		this.colorsList = params.colorsObj.length > 0 ? JSON.parse(params.colorsObj) : [];
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
	  return this.productForm.get('numberOfColor') as FormGroup;
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
  
	onSubmit(){
  
	  if (!this.imagesList || this.imagesList.length == 0 ) {
		this.openSnackBar('Please select at least one image','error');
		return;
	  }
	  if (this.productForm.get('productName').value == null || this.productForm.get('productName').value.trim() == '' || this.productForm.get('productName').value == undefined) {
		this.openSnackBar('Please fill the required fields ','error');
		return;
	  }
	  if (this.productForm.get('price').value == null || this.productForm.get('price').value.trim() == '' || this.productForm.get('price').value == undefined) {
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
		id: this.productDate.id,
		productName: this.productForm.value.productName,
		price: this.productForm.value.price,
		oldPrice: this.productForm.value.oldPrice,
		shortDescription: this.productForm.value.shortDescription,
		stock: this.productForm.value.stock,
		brand: this.productForm.value.brand,
		category: this.productForm.value.category,
		textDescription: this.textDescription,
		productImages: this.imagesList,
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
			this.openSnackBar("Product has been Updated succefully","success");
			this.router.navigate(['/admin-panel/products'])
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

	dragStart(event: any, index: number) {
		this.dragIndex = index;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', index.toString());
	  }
	
	  dragOver(event: any) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	  }
	
	  drop(event: any, index: number) {
		event.preventDefault();
		const fromIndex = this.dragIndex;
		const toIndex = index;
		if (fromIndex !== toIndex) {
		  const draggedImage = this.imagesList[fromIndex];
		  this.imagesList.splice(fromIndex, 1);
		  this.imagesList.splice(toIndex, 0, draggedImage);
		  this.updateImagePriorities();
		}
	  }
	
	  updateImagePriorities() {
		this.imagesList.forEach((image, index) => {
		  image.priority = index;
		});
	  }
	
	  deleteImage(index: number) {
		let img : any = this.imagesList.splice(index, 1);

		if(img[0].id && img[0].id != ''){
			this.deletedImagesList.push(img[0]);
		}
		this.updateImagePriorities();
	  }
	
	  addImage(event: any) {
		const files = event.target.files;
		for (let i = 0; i < files.length; i++) {
		  const file = files[i];
		  const reader = new FileReader();
		  reader.onload = (e: any) => {
			const image = {
			  id: '',
			  imagePath: e.target.result,
			  priority: this.imagesList.length
			};
			this.imagesList.push(image);
		  };
		  reader.readAsDataURL(file);
		}
	  }
	
}
