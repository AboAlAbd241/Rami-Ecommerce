import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastOptions, ToastaService } from 'ngx-toasta';
import { map } from 'rxjs';
import { AuthService } from 'src/app/Services/auth/auth.service';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';

@Component({
  selector: 'embryo-Register',
  templateUrl: './Register.component.html',
  styleUrls: ['./Register.component.scss']
})
export class RegisterComponent implements OnInit {

  signupForm: FormGroup;
  signupError: string | null = null;

  subscription : any ;
  loading = false;



  constructor(private fb: FormBuilder, 
              private httpReq : HttpRequestService,
              private auth : AuthService,
              private router: Router,
              private toastyService: ToastaService) {

    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      city: ['', Validators.required],
      streetName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],  // Assuming a 10 digit phone number
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });

  }

  ngOnInit() {
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('password').value;
    const confirmPassword = group.get('confirmPassword').value;

    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }
    this.loading = true;

    // Call the signup service (similar to login logic but with sign-up endpoint)
    const formData = this.signupForm.value;

    var payload = {
      apiName: 'signUp',
      body: formData,
      method: 'POST'
      };

      this.subscription = this.httpReq.makeHttpRequest(payload)
		   .pipe(
		   map(res => res)
		   )
		   .subscribe(
		   data => {
        this.auth.signUp(data.token);
        this.loading = false;
        let toastOption: ToastOptions = {
          title: "Your account has Registered succefully",
          msg: "Welcome "+ formData.firstName,
          showClose: true,
          timeout: 3000,
          theme: "material"
        };
    
        this.toastyService.wait(toastOption);
        this.router.navigate(['/home']);
      },
		   error => {
			  // Handle the subscription error here
        this.loading = false;
			  console.error('An error occurred:', error);
        this.auth.openInfoDialog(error.error.message);
		   }
		   );
      

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}


