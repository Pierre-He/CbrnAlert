
import { Component, forwardRef, OnDestroy, OnInit, Optional, Self } from '@angular/core';

@Component({
    selector: 'app-dual-marker',
    templateUrl: './dual-marker.component.html',
    styleUrls: ['./dual-marker.component.scss']
  })
  export class DualLocationComponent implements OnInit {


    ngOnInit(): void {}

    onEnter(): void {
      // Logic to update marker positions based on form values
    }
  
    setFromMarkers(): void {
      // Logic to fetch markers' positions and update form values
    }
  }