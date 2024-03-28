import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapPlotListComponent } from './map-plot-list/map-plot-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MapPlotListItemComponent } from './map-plot-list-item/map-plot-list-item.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { PlotDetailsDialogComponent } from './plot-details-dialog/plot-details-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [
    MapPlotListItemComponent,
    MapPlotListComponent,
    PlotDetailsDialogComponent
  ],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatRippleModule,
  ],
  exports: [
    MapPlotListComponent
  ]
})
export class MapPlotListModule { }
