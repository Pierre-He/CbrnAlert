import { LocationComponent } from './location/location.component';
import { LocationArrayComponent } from './location-array/location-array.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

//import { MarkerService } from 'src/app/core/services/marker.service';

@NgModule({
  declarations: [
    LocationComponent,
    LocationArrayComponent,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    //MarkerService
  ],
  exports: [
    LocationArrayComponent,
    LocationComponent,
  ]
})
export class LocationFormModule { }
