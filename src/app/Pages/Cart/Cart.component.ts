import { Component, OnInit, AfterViewChecked} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ChangeDetectorRef } from '@angular/core';

import { EmbryoService } from '../../Services/Embryo.service';

@Component({
  selector: 'embryo-Cart',
  templateUrl: './Cart.component.html',
  styleUrls: ['./Cart.component.scss']
})
export class CartComponent implements OnInit, AfterViewChecked {

	products       : any;
	// quantityArray  : number[] = [1,2,3,4,5,6,7,8,9,10];
	popupResponse  : any;

	constructor(public embryoService : EmbryoService,
					private router: Router,
					private loadingBar: LoadingBarService,
					private cdRef : ChangeDetectorRef) {
	}

	ngOnInit() {
		this.getProducts();
		this.embryoService.calculateLocalCartProdCounts();
	}

	ngAfterViewChecked() : void {
		this.cdRef.detectChanges();
	}

	getProducts(){
		// this.embryoService.getProducts()?.valueChanges().subscribe(res => this.getProductResponse(res));
		this.getProductResponse(this.embryoService.getProducts());
	}

	// getProductResponse method is used to get the response of all products.
	public getProductResponse(response) {
		// this.products = null;
		// let data = ((response.men.concat(response.women)).concat(response.gadgets)).concat(response.accessories);
		this.products = response;
	}

	public removeProduct(value:any) {
		let message = "Are you sure you want to delete this product?";
		this.embryoService.confirmationPopup(message).
			subscribe(res => {this.popupResponse = res},
						 err => console.log(err),
						 ()  => this.getPopupResponse(this.popupResponse, value)
						);
	}

	public getPopupResponse(response, value) {
		if(response){
			this.embryoService.removeLocalCartProduct(value);
		}
	}

	public calculateProductSinglePrice(product:any, value: any) {
		let price = 0;
		product.quantity = value;
		price = product.price*value;
		return price;
	}

	public calculateTotalPrice() {
		let subtotal = 0;
		if(this.embryoService.localStorageCartProducts && this.embryoService.localStorageCartProducts.length>0) {
			for(let product of this.embryoService.localStorageCartProducts) {
				subtotal += (product.price *product.quantity);
			}
			return subtotal;
		}
		return subtotal;

	}

	public getTotalPrice() {
		let total = 0;
		if(this.embryoService.localStorageCartProducts && this.embryoService.localStorageCartProducts.length>0) {
			for(let product of this.embryoService.localStorageCartProducts) {
				total += (product.price*product.quantity);
			}
			total += (this.embryoService.shipping+this.embryoService.tax);
			return total;
		}

		return total;

	}

	public updateLocalCartProduct() {
		this.embryoService.updateAllLocalCartProduct(this.embryoService.localStorageCartProducts);
		this.router.navigate(['/checkout'])
	}

	public getQuantityValue(product) {
		if(product.quantity) {
			return product.quantity
		} else {
			return 1;
		}
	}

	public onChange(value, product){
		let price = 0;
		product.newPrice = 0;
		for(let data of this.products){
			if(data.id == product.id){
				price = data.price;
			}
		}
		let newPrice = price*value;
		product.newPrice = newPrice;
		product.quantity = value;
		this.embryoService.updateLocalCartProduct(product);
	}
}
