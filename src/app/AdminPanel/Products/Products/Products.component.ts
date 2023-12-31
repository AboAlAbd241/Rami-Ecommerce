import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AdminPanelServiceService } from '../../Service/AdminPanelService.service';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';
import { map } from 'rxjs';

@Component({
	selector: 'app-products',
	templateUrl: './Products.component.html',
	styleUrls: ['./Products.component.scss']
})

export class ProductsComponent implements OnInit {
	
	productsList 		        : any;
	productsGrid 			    : any;
	popUpDeleteUserResponse 	: any;
	showType	    			: string = 'grid';
	displayedProductColumns : string [] = ['id', 'image','name','brand','category', 'product_code', 'old_price', 'price','action' ];
	@ViewChild(MatPaginator) paginator : MatPaginator;
	@ViewChild(MatSort) sort           : MatSort;

	subscription : any ;

	resultsPerPage	: any 	 = "20";
	selectedCategory: string = "";
	selectedBrad    : string = "";
	sortBy		  	: any 	 = 'DEFAULT';
	isLoading		 		 =	false;
	// productList     : any ;
	categoryType;
	totalPages;

	searchText;




	searchObj = {search : '', size : 20, page : 0, sortType : this.sortBy, categoryId : "", brandId : ""};


	constructor(public translate : TranslateService,
					private router : Router, 
					private adminPanelService : AdminPanelServiceService, 
					private httpReq : HttpRequestService) { }

	ngOnInit() {
		this.categories();
		this.getProducts();

	}

	public getProducts() {

		this.isLoading = true;
		this.searchObj.sortType = this.sortBy;
		this.searchObj.size = this.resultsPerPage;
		this.searchObj.categoryId = this.selectedCategory;
		this.searchObj.brandId = this.selectedBrad;

		if(this.searchText && this.searchText.trim() != ''){
			this.searchObj.search = this.searchText;
		}


		var payload = {
		   apiName: 'getProductByTextSearch',
		   body: this.searchObj,
		   method: 'POST'
		   };
		
		   this.subscription = this.httpReq.makeHttpRequest(payload)
		   .pipe(
		   map(res => res)
		   )
		   .subscribe(
		   data => {
			  this.productsGrid = data.products;
			  this.totalPages = data.totalPages;
			  this.formatProduct();
			  this.isLoading = false;
			  this.searchObj.search = "";

		   },
		   error => {
			  // Handle the subscription error here
			  console.error('An error occurred:', error);
			  this.isLoading = false;
			  this.searchObj.search = "";
		   }
		   );
	 }


	 public categories(){
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
	  
			  //get category
			  for(const categorey of data.categories){
				this.categoryType.push({value : categorey.englishName, id : categorey.id, features: categorey.features });
			  }
	  
			},
			error => {
			  // Handle the subscription error here
			  console.error('An error occurred:', error);
			}
		  );
	}


  	/**
	  * productShowType method is used to select the show type of product.
	  */
	productShowType(type) {
		this.showType = type;
		if(type == 'list'){
			document.getElementById('list').classList.add("active");
			document.getElementById('grid').classList.remove('active');
			this.productsList = new MatTableDataSource(this.productsGrid);
			setTimeout(()=>{
				this.productsList.paginator = this.paginator;
				this.productsList.sort = this.sort;
			},0)
			
		}
		else{
			document.getElementById('grid').classList.add("active");
			document.getElementById('list').classList.remove('active');
		}
	}

	/**
	  * onEditProduct method is used to open the edit page and edit the product.
	  */
	onEditProduct(data){
		data.categories = data.categories[0].id;
		
		if(data.brand){
			data.brand = data.brand.id; 
		}else{
			data.brand = '';
		}

		if(data.productColors.length > 0){
			data.isMultipleColor = true;
			data.numberOfColor = data.productColors.length;
			let colorsArray = [];
			for(let colors of data.productColors){
				colorsArray.push(colors.color)
			}
			data.colors = colorsArray;
			data.colorsObj = JSON.stringify(data.productColors);
		}else{
			data.colors = [];
			data.colorsObj = [];
		}

		if(data.images.length > 0){
			data.images = JSON.stringify(data.images);
		}

		if(data.productFeatures && data.productFeatures.length > 0){
			data.productFeatures = JSON.stringify(data.productFeatures);
		}

		
		if(data.storageOptions && data.storageOptions.length > 0){
			data.storageOptions = JSON.stringify(data.storageOptions);
		}

		this.router.navigate(['/admin-panel/product-edit',data.id],{ queryParams: data});
	}

	/* 
     *deleteProduct method is used to open a delete dialog.
     */
   deleteProduct(i, id, imagesPath){
      this.adminPanelService.deleteDialog("Are you sure you want to delete this product permanently?").
         subscribe( res => {this.popUpDeleteUserResponse = res},
                    err => console.log(err),
                    ()  => this.getDeleteResponse(this.popUpDeleteUserResponse,i, id, imagesPath))
   }

   /**
     * getDeleteResponse method is used to delete a product from the product list.
     */
   getDeleteResponse(response : string, i, id, imagesPath){

      if(response == "yes"){
		let imagesName = [];
		for(let img of imagesPath){
			let imageName = img['imagePath'].split('/');
			imageName = imageName[imageName.length -1];
			imagesName.push(imageName);
		}

		let deleeteBody = {id: id, imageName:imagesName}

		var payload = {
			apiName: 'deleteProduct',
			body: deleeteBody,
			method: 'POST'
		  };
	  
		  this.subscription = this.httpReq.makeHttpRequest(payload)
		  .pipe(
			map(res => res)
		  )
		  .subscribe(
			data => {
				if(data.message === '00000'){
					if(this.showType == 'grid') {
						this.productsGrid.splice(i,1);
					 }else if(this.showType == 'list'){
						   this.productsList.data.splice(i,1);
						   this.productsList = new MatTableDataSource(this.productsList.data);
						 this.productsList.paginator = this.paginator;
					 }
				}
			},
			error => {
			  // Handle the subscription error here
			  console.error('An error occurred:', error);
			}
		  );
      }
   }

   getFirstImage(images){
	let img = images.filter(img => img.priority == 0);
	return img[0].imagePath;
   }

   formatProduct(){

	this.productsGrid?.forEach(product => {
	   
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

   get displayedPages(): number[] {
	let start = Math.max(this.searchObj.page, 0);
	let end = Math.min(this.searchObj.page + 3, this.totalPages);
	return Array.from({length: (end - start)}, (_, i) => start + i + 1);
}

  changePage(page: number): void {
	this.searchObj.page = page;
	this.getProducts();
  }


   ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
