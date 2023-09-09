import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastOptions, ToastaService } from 'ngx-toasta';
import { map } from 'rxjs';
import { InfoDialogComponent } from 'src/app/Global/info-dialog/info-dialog.component';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';

@Component({
  selector: 'embryo-ForgotPassword',
  templateUrl: './ForgotPassword.component.html',
  styleUrls: ['./ForgotPassword.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  subscription : any ;
  loading = false;



  constructor(private fb: FormBuilder, private httpReq : HttpRequestService,
               public dialog: MatDialog,
               private router : Router,
               private toastyService: ToastaService) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required]]
    }, {
      validators: this.emailMatchValidator
    });
  }

  emailMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const email = control.get('email');
    const confirmEmail = control.get('confirmEmail');

    if (email && confirmEmail && email.value !== confirmEmail.value) {
      return { 'emailsMismatch': true };
    }
    return null;
  }

  onPasswordReset(): void {

    this.loading = true;

  
     // Call the signup service (similar to login logic but with sign-up endpoint)
     const formData = this.forgotPasswordForm.value;

     var payload = {
       apiName: 'forgetPassword',
       body: formData,
       method: 'POST'
       };
 
       this.subscription = this.httpReq.makeHttpRequest(payload)
        .pipe(
        map(res => res)
        )
        .subscribe(
        data => {
          this.loading = false;
          this.router.navigate(['/home']);

          let toastOption: ToastOptions = {
            title: "The email has been sent succefully",
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
         this.openInfoDialog(error.error.message);
        }
        );

  }

  openInfoDialog(message: string): void {
    this.dialog.open(InfoDialogComponent, {
      width: '30%',
      data: { message: message }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
