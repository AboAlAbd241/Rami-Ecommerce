import { Routes } from '@angular/router';
import { ProductsComponent } from './Products/Products.component';
import { EditProductComponent } from './EditProduct/EditProduct.component';
import { AddProductComponent } from './AddProduct/AddProduct.component';
import { ProductFormComponent } from './AddProduct/product-form/product-form.component';

export const ProductsRoutes: Routes = [
	{
      path: '',
      redirectTo: 'ProductsComponent',
      pathMatch: 'full'
   },
	{
		path      : '',
		children: [ 
         {
            path      : 'product-edit',
            component : EditProductComponent
         },
         {
            path: 'product-edit/:id',
            component: ProductFormComponent
         },
         {
            path      : 'product-add',
            component : AddProductComponent
         },
         {
         	path      : 'products',
				component : ProductsComponent
         }
      ]
   }
];
