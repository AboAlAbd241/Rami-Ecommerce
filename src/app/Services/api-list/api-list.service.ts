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
    getBanners:"/get-banners",
    getProductById:"/get-product-by-id",
    getProductByTextSearch:"/get-product-by-name",
    getMainProducts:"/get-main-products",
    createAnOrder:"/create-order",
    signUp:"/auth/sign-up",
    logIn:"/auth/login",
    forgetPassword:"/auth/forgot-password",

    // auth req 
    addProduct : "/admin/add-product",
    addCategory : "/admin/add-category",
    deleteProduct: "/admin/delete-product",
    updateProduct: "/admin/update-product",
    saveCategoryFeature:"/admin/save-category-feature",
    updateBanner: "/admin/update-banner",
    getOrders: "/admin/get-orders",
    getOrderById:"/admin/get-order",
    updateOrder:"/admin/update-order",
    getReport:"/admin/get-report",
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
