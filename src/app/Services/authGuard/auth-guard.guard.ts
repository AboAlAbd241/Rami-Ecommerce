import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      // User is not logged in, allow access to the 'checkout' route
      return true;
    } else {
      // User is logged in, prevent access to the 'checkout' route
      // You can also redirect to a different route if needed
      this.router.navigate(['/home']); // Redirect to the 'home' route, for example
      return false;
    }
  
  }
}
