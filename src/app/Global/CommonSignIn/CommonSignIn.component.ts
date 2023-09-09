import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { debug } from 'console';
import { stat } from 'fs';
import { AuthService } from 'src/app/Services/auth/auth.service';

@Component({
  selector: 'embryo-SignIn',
  templateUrl: './CommonSignIn.component.html',
  styleUrls: ['./CommonSignIn.component.scss']
})
export class CommonSignInComponent implements OnInit {

  loginForm: FormGroup;

  @Input() isFromCheckOut: boolean;
  loading: boolean = false;


  constructor(private auth :AuthService, private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
   }

  ngOnInit() {
  }

  onSubmit() {

    this.loading = true;

    if (this.loginForm.invalid) {
      // Display errors
      return;
    }

    let credential = {
      email:  this.loginForm.get('email').value,
      password: this.loginForm.get('password').value
    }
    
    this.auth.login(credential, this.isFromCheckOut);

    this.auth.getLoginResult().subscribe((result) => {
      if (result === 'success') {

        if (this.isFromCheckOut) {
          this.router.navigate(['/cart']);
        } else {
          this.router.navigate(['/home']);
        }

        // Login was successful
        // Handle success logic here, e.g., navigate to a different page
      } 
      this.loading = false;
    });

  }

}
