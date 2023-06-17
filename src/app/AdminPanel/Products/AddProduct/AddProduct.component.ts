import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-add-product',
	templateUrl: './AddProduct.component.html',
	styleUrls: ['./AddProduct.component.scss']
})
export class AddProductComponent implements OnInit {

  productType = [{value : "category"}, {value : "brand"},{value : "product"}];
  selectedType = null;



  constructor() { }

  ngOnInit(): void {
  }

  checkForm(): string{
    if(this.selectedType == 'category' || this.selectedType == 'brand'){
      return 'categoryFrom';
    }
    else if(this.selectedType == 'product') return 'productForm';

    return '';
  }




}
