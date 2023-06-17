import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {  map, Observable, throwError } from 'rxjs';
import { ApiListService } from '../api-list/api-list.service';
import { AuthService } from '../auth/auth.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {

  constructor(private http : HttpClient,
              private router : Router,
              private authService : AuthService,
              private apiList : ApiListService,
              public dialog: MatDialog ) { }


   /**
     * This function makes a http request to get the data based on the
     * requested api
     * @param data {Object} - payload of the request
     * Example:     data = {
     *                      apiName: 'profile',
                            queryParams: {}, // should be object
                            body: {}, // should be object
                            urlParams: [], // should be array
                            isServerData: true, // send false to get local json data
     *                  }
     */
    makeHttpRequest(data): Observable<any> {
      var options = { 'method': data.method, headers: null, params: data.queryParams ? data.queryParams : null, body: data.body ? data.body : null };


      // for blob type responses - set based on condition
      // options.responseType = ResponseContentType.Blob;

      // append url params
      let url: string = this.apiList.getUrl(data.apiName);
      if (data.urlParams && data.urlParams.length) {
          data.urlParams.forEach(param => {
              url = url + "/" + param;
          });
      }

      let observable: Observable<any> = null;
      // In case of post
      if(data.method != null && data.method.toLowerCase() == 'post') {
          observable = this.makePostHttpRequest(data, url);
      } else {
          observable =  this.makeGetHttpRequest(data, url ,options);
      }
      return observable;
  }

  private makeGetHttpRequest(data, url, options): Observable<any> {
    return this.http.get(url, { params: data.body ? data.body : null })
    .pipe(
      catchError(error => {
        this.errorHandler(error);
        return throwError(error); // Return an ObservableError using throwError
      })
    );

  }

  private makePostHttpRequest(data, url): Observable<any> {
      // this.currentUser = JSON.parse(sessionStorage.getItem('token'));
      // if(this.currentUser && this.currentUser.token) {
      //     this.setHeader('Authorization', this.currentUser.token);
      // }
      // this.setHeader('Content-Type', 'application/x-www-form-urlencoded');
      // this.setHeader('Accept-Language', this.commonService.selectedLanguage);

      // var headers= new RequestOptions({headers: this.headers});
      

      return this.http.post(url, data.body)
      .pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          this.errorHandler(error);
          return throwError(error); // Return an ObservableError using throwError
        })
      );

  }

  /**
    * This function is used to set passed header
    * @param key - Indicates the identifier of the header
    * @param value - Indicates the value of the identifier
    */
  // setHeader(key, value) {
  //     this.headers.set(key, value);
  // }

  /**
    * This function is used to remove all the headers after the call response
    */
  // removeHeaders() {
  //     this.headers.keys().forEach(key => {
  //         this.headers.delete(key);
  //     })
  // }


  /**
    * This function returns the http headers required for safe communication
    * between client and server to authorize the user
    * @param apiName {string} - api call name
    */
  // getHeaders(apiName: String): Headers {

  //     // set all headers here

  //     // set headers for blob and other type response
  //     this.setHeader('Content-Type', 'application/json');
  //     this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  //     if(this.currentUser && this.currentUser.token) {
  //         this.setHeader('Authorization', this.currentUser.token);
  //     }
  //     this.setHeader('Accept-Language', this.commonService.selectedLanguage);
  //     // this.setHeader('Content-Type', 'application/pdf'); // set based on reponse (text/blob)
  //     return this.headers;
  // }

  /**
    * This function is used to handle the errors
    * Note: handle errors based on requirement
    * @param errorObj {object} - error response object
    */
  errorHandler(errorObj: HttpErrorResponse) {


      if (errorObj.error instanceof ErrorEvent) {

          // A client-side or network error occurred. Handle it accordingly.
//            alert('Please check your internet connection!');
      } else if (errorObj.status == 0) {

          // show something went wrong
//            alert('Something went wrong!');
      } else {
          if (errorObj.status == 400) {

              // 400 error
//                alert('Bad Request!');
          }
          else if (errorObj.status == 404) {

              // 404 error
//                alert('URL not found!');
          }
          else if (errorObj.status == 500) {

              // 500 error
//                alert('Internal Server error!');
          }
          else if (errorObj.status == 401) {

                  // unauthorized error
                  // this.removeHeaders();
                  localStorage.clear();

                  // auto logout if 401 response returned from api
                  this.authService.logout();
                  this.router.navigate(['/sign-in'], { queryParams: { reason: 'timedOut' } });
          } else {
//                alert('Failed to get valid response from backend');
          }
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
      }
      // return of(this.dataObj);
  }
}
