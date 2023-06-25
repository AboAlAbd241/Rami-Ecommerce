import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiListService {
  authUrl = environment.authUrl;
  appUrl = environment.appUrl;

  // Add server urls in below object
  serverUrlPath = {
    // not auth request
    getCategoryAndBrands :"/get-category-and-brands",
    getProductAdmin:"/admin-get-product",
    getCategory:"/get-category",

    // auth req 
    addProduct : "/admin/add-product",
    addCategory : "/admin/add-category",
    deleteProduct: "/admin/delete-product",
    updateProduct: "/admin/update-product",
    saveCategoryFeature:"/admin/save-category-feature",
  };


  constructor() { }

  /**
   * This function is used to create and return api url
   * @param apiName - name of the api.
   (        data fron the server or from a local Json file.
    */
  getUrl(apiName) {
    return this.authUrl + this.serverUrlPath[apiName];
  }
}
