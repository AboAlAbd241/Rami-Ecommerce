import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';

import { InvoicesComponent } from './Invoices/Invoices.component';
import { InvoicesRoutes} from './Invoices.routing';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';


@NgModule({
	declarations: [InvoicesComponent],
	providers: [DatePipe],
	imports: [
		MatIconModule,
		MatButtonModule,
		MatCardModule,
		MatTableModule,
      CommonModule,
      MatFormFieldModule,
      MatInputModule,
      FlexLayoutModule,
      MatPaginatorModule,
	  MatSelectModule,
	  FormsModule,
	  MatDatepickerModule,
		RouterModule.forChild(InvoicesRoutes)
	]
})
export class InvoicesModule { }
