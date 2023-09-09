import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth/auth.service';

@Component({
  selector: 'embryo-HeaderUserProfileDropdown',
  templateUrl: './HeaderUserProfileDropdown.component.html',
  styleUrls: ['./HeaderUserProfileDropdown.component.scss']
})
export class HeaderUserProfileDropdownComponent implements OnInit {

  token;
  isLoggedIn = false;

  private tokenSubscription: Subscription;


   constructor(private auth :AuthService) {
      this.token = auth.getAuthToken();
      this.isLoggedIn = this.token ? true : false; 
    }

   ngOnInit() {

    this.tokenSubscription = this.auth.watchTokenChanges().subscribe(newToken => {
      console.log('Token has changed:', newToken);
      this.isLoggedIn = newToken ? true : false; 
    });

   }

   logout(){
    this.auth.logout();
   }

   ngOnDestroy() {
    // Don't forget to unsubscribe to prevent memory leaks
    this.tokenSubscription.unsubscribe();
  }
}
