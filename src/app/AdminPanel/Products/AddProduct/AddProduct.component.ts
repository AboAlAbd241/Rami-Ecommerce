import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-add-product',
	templateUrl: './AddProduct.component.html',
	styleUrls: ['./AddProduct.component.scss']
})
export class AddProductComponent implements OnInit {

  productType = [{value : "category"},{value : "featur Category"}, {value : "brand"},{value : "product"},{value : 'banner'}];
  selectedType = null;



  constructor() { }

  ngOnInit(): void {
  }

  checkForm(): string{
    if(this.selectedType == 'category' || this.selectedType == 'brand'){
      return 'categoryFrom';
    }
    else if(this.selectedType == 'product') return 'productForm';
    else if(this.selectedType == 'featur Category') return 'featur Category';
    else if(this.selectedType == 'banner') return 'banner';
    return '';
  }




}
