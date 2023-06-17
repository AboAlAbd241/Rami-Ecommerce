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

    addProduct : "/admin/add-product",
    addCategory : "/admin/add-category",
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
