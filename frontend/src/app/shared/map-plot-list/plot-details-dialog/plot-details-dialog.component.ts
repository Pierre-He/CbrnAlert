import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-plot-details-dialog',
    templateUrl: './plot-details-dialog.component.html',
})

export class PlotDetailsDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  }