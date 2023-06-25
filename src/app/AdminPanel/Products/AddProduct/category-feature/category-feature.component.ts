import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { HttpRequestService } from 'src/app/Services/httpRequest/http-request.service';

@Component({
  selector: 'app-category-feature',
  templateUrl: './category-feature.component.html',
  styleUrls: ['./category-feature.component.css']
})
export class CategoryFeatureComponent implements OnInit {
  categoryForm: FormGroup;
  categories = [] ;
  subscription;
  selectedCategory = null;
  featureList = [];

    //toast
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
    
  //spinner
  loading: boolean = false;


  constructor(private formBuilder: FormBuilder,private httpReq : HttpRequestService,
    private _snackBar: MatSnackBar,private router : Router) {
    this.categoryForm = this.formBuilder.group({
      categoryFeatures: this.formBuilder.array([]) // Should be categoryFeatures
    });
  }

  ngOnInit(): void {
    this.loadCategory();

  }

  loadCategory(){
    this.loading = true;
    var payload = {
      apiName: 'getCategory',
      body: '',
      method: 'POST'
    };

    this.subscription = this.httpReq.makeHttpRequest(payload)
    .pipe(
      map(res => res)
    )
    .subscribe(
      data => {
        if(data.message == '00000'){
          this.categories = data.categories
        }
        this.loading = false;
      },
      error => {
        this.loading = false;
        // Handle the subscription error here
        console.error('An error occurred:', error);
        this.openSnackBar('Something went wrong','error');
      }
    );
  }

  get categoryFeatureControls() {
    return this.categoryForm.get('categoryFeatures') as FormArray;
  }

  addCategoryFeature(): void {
      const categoryFeatureGroup = this.formBuilder.group({
        id: [''],
        key: ['',Validators.required],
        values: this.formBuilder.array([])
      });
  
      this.categoryFeatureControls.push(categoryFeatureGroup);
    
  }

  removeCategoryFeature(index: number): void {
    this.categoryFeatureControls.removeAt(index);
  }

  addValue(categoryFeatureGroup: FormGroup): void {
    const valuesArray = categoryFeatureGroup.get('values') as FormArray;
    const valueFormGroup = this.formBuilder.group({
      value: ['', Validators.required]
    });
    valuesArray.push(valueFormGroup);
  }

  removeValue(categoryFeatureGroup: FormGroup, index: number): void {
    const valuesArray = categoryFeatureGroup.get('values') as FormArray;
    valuesArray.removeAt(index);
  }

  onSubmit(): void {


    if (this.categoryForm.invalid) {
      this.openSnackBar('Please Fill the fields','error');
      return;
    }

    let categoryFeature = this.categoryForm.value.categoryFeatures;


    for(let i = 0 ; i < categoryFeature.length ; i++){
      for(let j = 0 ; j < categoryFeature[i].values.length ; j++){
        categoryFeature[i].values[j] = categoryFeature[i].values[j].value;
      }
    }

    this.loading = true;
    let request = {
      id: this.selectedCategory,
      categoryFeature: categoryFeature
    }

    
    var payload = {
      apiName: 'saveCategoryFeature',
      body: request,
      method: 'POST'
    };

    this.subscription = this.httpReq.makeHttpRequest(payload)
    .pipe(
      map(res => res)
    )
    .subscribe(
      data => {
        this.loadCategory();
        this.loading = false;
        if(this.featureList){
          this.openSnackBar('The feature has been updated succefully','success');
        }else{
          this.openSnackBar('The feature has been added succefully','success');
        }
        this.categoryFeatureControls.clear();
        this.selectedCategory = null;
      },
      error => {
        this.loading = false;
        // Handle the subscription error here
        console.error('An error occurred:', error);
        this.openSnackBar('Something went wrong','error');
      }
    );

  }

  getFeature(){
    this.categoryFeatureControls.clear();
    if(this.categories && this.categories.length > 0){
      this.featureList = this.categories.filter(item => {
        return item.id === this.selectedCategory;
      })

      this.featureList = this.featureList[0].features;

      if(this.featureList){
        for(let feature of this.featureList){
          const categoryFeatureGroup = this.formBuilder.group({
            id: [feature.id],
            key: [feature.key,Validators.required],
            values: this.formBuilder.array([])
          });
      
          this.categoryFeatureControls.push(categoryFeatureGroup);
  
          for(let value of feature.values){
            const valuesArray = categoryFeatureGroup.get('values') as FormArray;
            const valueFormGroup = this.formBuilder.group({
              value: [value, Validators.required]
            });
            valuesArray.push(valueFormGroup);
          }
         
        }
      }
    }

    if(this.categoryFeatureControls.value.length == 0){
        this.addCategoryFeature(); // Add an initial empty category feature row
    }

  }

  openSnackBar(msg: string, type: string) {
    const panelClass = (type === 'error') ?  'custom-toast-error' :'custom-toast-success';
    this._snackBar.open(msg, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000,
      panelClass: panelClass,
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
