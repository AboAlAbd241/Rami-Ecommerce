import { AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute }   from '@angular/router';
import algoliasearch from 'algoliasearch/lite';
import { EmbryoService } from '../../../Services/Embryo.service';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';
import { map } from 'rxjs';
const searchClient = algoliasearch(
	'latency',
	'6be0576ff61c053d5f9a3225e2a90f76'
 );

@Component({
	selector: 'app-ProductsList',
	templateUrl: './ProductsList.component.html',
	styleUrls: ['./ProductsList.component.scss']
})
export class ProductsListComponent implements OnInit, AfterViewInit  {

	type          : any;
	pips          : boolean = true;
	tooltips      : boolean = true;
	category      : any;
	pageTitle     : string;
	subPageTitle  : string;
	subscription  : any ;
	productList   : any ;
	resultsPerPage: any 	= 10;
	sortBy		  : any 	= 'DEFAULT';
	requestType   : any ;

	selectedCategory: string = "";
	selectedBrad    : string = "";

	isLoading = false;
	categoryType;


	//for pagination
	pageChanged ;
	searchObj = {search : '', size : 10, page : 0, sortType : this.sortBy,categoryId : "",brandId : ""};
	totalPages;


	public subscribers: any = {};


	constructor(private route: ActivatedRoute,private router: Router,
		 public embryoService : EmbryoService,private httpReq : HttpRequestService,
		 private activeRoute: ActivatedRoute) {}

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.route.queryParams.forEach(queryParams => {
				this.category = queryParams['category'];
				this.type   = null;
				this.type = params['type'];

				this.getPageTitle();

			});
		});

		this.route.queryParams.subscribe(params => {
			this.requestType = params.type;
			if(params.type && params.type == 'mainSearch'){
				this.searchObj.search = params.search;
				this.categories();
			}
			if(params.type && params.type == 'categorySearch'){
				this.selectedCategory = params.id;
			}
			if(params.type && params.type == 'brandSearch'){
				this.selectedBrad = params.id;
			}
			this.getProducts();
		  });
	}

	ngAfterViewInit() {

	  }

	public getProducts() {

		this.isLoading = true;
		this.searchObj.sortType = this.sortBy;
		this.searchObj.size = this.resultsPerPage;
		this.searchObj.categoryId = this.selectedCategory;
		this.searchObj.brandId = this.selectedBrad;
	
		let apiName = 'getProductAdmin';
		let body : any = '';
		if(this.requestType == 'mainSearch' || this.requestType == 'categorySearch' || this.requestType == 'brandSearch'){
			apiName = 'getProductByTextSearch';
			body = this.searchObj;
		}


		var payload = {
		   apiName: apiName,
		   body: body,
		   method: 'POST'
		   };
		
		   this.subscription = this.httpReq.makeHttpRequest(payload)
		   .pipe(
		   map(res => res)
		   )
		   .subscribe(
		   data => {
			  this.productList = data.products;
			  this.totalPages = data.totalPages;
			  this.formatProduct();
			  this.isLoading = false;

		   },
		   error => {
			  // Handle the subscription error here
			  console.error('An error occurred:', error);
			  this.isLoading = false;
		   }
		   );
	 }
  

	public getPageTitle() {
		this.pageTitle = null;
		this.subPageTitle = null;

		switch (this.type || this.category) {
			case undefined:
				this.pageTitle = "Fashion";
				this.subPageTitle="Explore your favorite fashion style.";
				break;

			case "gadgets":
				this.pageTitle = "Gadgets";
				this.subPageTitle="Check out our new gadgets.";
				break;

			case "accessories":
				this.pageTitle = "Accessories";
				this.subPageTitle="Choose the wide range of best accessories.";
				break;

			default:
				this.pageTitle = "Products";
				this.subPageTitle = null;
				break;
		}
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

	public addToCart(value) {
		this.embryoService.addToCart(value);
	}

	public addToWishList(value) {
		this.embryoService.addToWishlist(value);
	}

	public transformHits(hits) {
		hits.forEach(hit => {
			hit.stars = [];
			for (let i = 1; i <= 5; i) {
			  hit.stars.push(i <= hit.rating);
			  i += 1;
			}
		});
		return hits;
	}

	formatProduct(){

		this.productList?.forEach(product => {
		   
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
