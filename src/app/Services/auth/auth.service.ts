import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, map, Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { ApiListService } from '../api-list/api-list.service';
import { LoginDialogComponent } from 'src/app/Global/login-dialog/login-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject : BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http : HttpClient, private apiList : ApiListService, public dialog: MatDialog) {
    this.currentUserSubject = new BehaviorSubject<any>(localStorage.getItem('token'));
    this.currentUser = this.currentUserSubject.asObservable();
 }





 login(credential) {

  var payload = {
          apiName: 'login',
          queryParams: {}, // should be object
          body: credential, // should be object if the call is POST
          urlParams: [], // should be array
          method: 'POST'
  }

  // append url params
  let url: string = this.apiList.getUrl(payload.apiName);
  if (payload.urlParams && payload.urlParams.length) {
    payload.urlParams.forEach(param => {
          url = url + "/" + param;
      });
  }

  var observable = this.makePostHttpRequest(payload, url);

  return observable.pipe(map(token => {
      // login successful if there's a jwt token in the response
      if (token && token != '') {
          // store jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', token);
          this.currentUserSubject.next(token);
          return "success";
      }

      return "fail";
  }));

}


 private makePostHttpRequest(data, url): Observable<any> {


  // var headers = new Headers();
  // headers.set('Content-Type', 'application/x-www-form-urlencoded');
  // var options = new RequestOptions({headers: headers});

  return this.http
          .post(url, data.body).pipe(map(response => {
              return response['accessToken'];
          }))
              .pipe(catchError(this.errorHandler.bind(this)));

}


  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  getAuthToken():string {
     return localStorage.getItem('token');
    }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  errorHandler(errorObj: HttpErrorResponse) {


    if (errorObj.error instanceof ErrorEvent) {

        // A client-side or network error occurred. Handle it accordingly.
//            alert('Please check your internet connection!');
    } else if (errorObj.status == 0) {

        // show something went wrong
//            alert('Something went wrong!');
    } else {
        if (errorObj.status == 400) {
            this.dialog.open(LoginDialogComponent);

            // 400 error
//                alert('Bad Request!');
        }
        else if (errorObj.status == 404) {

            // 404 error
//                alert('URL not found!');
        }
        else if (errorObj.status == 500) {
          this.dialog.open(LoginDialogComponent);

            // 500 error
//                alert('Internal Server error!');
        }
        else if (errorObj.status == 401) {
                this.dialog.open(LoginDialogComponent);
                // unauthorized error
                // this.removeHeaders();
                localStorage.clear();

                // auto logout if 401 response returned from api
                // this.authService.logout();
                // this.router.navigate(['/sign-in'], { queryParams: { reason: 'timedOut' } });
        } else {
//                alert('Failed to get valid response from backend');
        }
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
    }
    // return of(this.dataObj);
}


}

