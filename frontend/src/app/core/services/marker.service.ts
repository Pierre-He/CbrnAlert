import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeoPoint } from '../api/models';
import { LeafletMapComponent } from 'src/app/shared/leaflet-map/leaflet-map.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {

  //array for dualMarkers
  private markers: GeoPoint[]=[];
  
  private leafletMapComponent: LeafletMapComponent;

  //create a boolean for the dualMarker Mode
  private dualMarkerMode = new BehaviorSubject<boolean>(false);
  dualMarkerMode$ = this.dualMarkerMode.asObservable();

  //for dual marker component 
  private dualMarkersSource = new BehaviorSubject<GeoPoint[]>([]);
    dualMarkers$ = this.dualMarkersSource.asObservable();

  //observable for individual marker
  private markerPositionSource = new BehaviorSubject<GeoPoint>({ lat: 0, lon: 0 });
  marker$ = this.markerPositionSource.asObservable();

  //create an observable on the marker array
  private markerPositionsSource = new BehaviorSubject<GeoPoint[]>([]);
  markerPositions$ = this.markerPositionsSource.asObservable();

  
  constructor(private snackBar: MatSnackBar) {}

  //switch the value of said boolean
  toggleDualMarkerMode() {
    this.dualMarkerMode.next(!this.dualMarkerMode.value);
  }

  setMarker(marker: GeoPoint) {
    if (this.dualMarkerMode.getValue()) {
        if (this.markers.length >= 2) {
            this.markers.shift(); // Remove the first marker (FIFO)
        }
        this.markers.push(marker); // Add the new marker as the second
    } else {
        this.markers = [marker]; // Single marker mode: only one marker at a time
    }
    this.markerPositionsSource.next([...this.markers]);
  }
  

  getMarkers(): GeoPoint[] {
    return this.markers;
  }

  //leafletmap component ref to access clearAllMarkers
  public setLeafletMapComponent(component: LeafletMapComponent): void {
    this.leafletMapComponent = component;
  }

  // Method to clear all markers
  public clearAllMarkers(): void {
      if (this.leafletMapComponent) {
          this.leafletMapComponent.clearAllMarkers();
          //alert("Clear all from Service")
      }
  }

  public updateMarkerPosition(newPosition: GeoPoint): void {
    //this.markerPositionSource.next(newPosition)
    this.markers = [newPosition];
    console.log("Marker position updated in service:", newPosition);
  }

  getLatestMarkerPosition(): GeoPoint | null {
    
    if (this.markers.length > 0) {
        return this.markers[this.markers.length - 1]; 
    } else {
        return null; 
    }
  }

  //depending on the selection of categories, toggles
  toggleDualMarkerModeAndShowSnackBar() {
    alert("in toggle dual marker in service")
    const currentValue = this.dualMarkerMode.getValue();
    this.dualMarkerMode.next(!currentValue);
    this.snackBar.open(`Dual Marker Mode is now: ${!currentValue ? 'ON' : 'OFF'}`, 'Close', {
      duration: 3000,
    });
  }

}