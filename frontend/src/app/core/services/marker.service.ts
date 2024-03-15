import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeoPoint } from '../api/models';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {

  //array for dualMarkers
  private markers: GeoPoint[]=[];


  //create a boolean for the dualMarker Mode
  private dualMarkerMode = new BehaviorSubject<boolean>(false);
  dualMarkerMode$ = this.dualMarkerMode.asObservable();

  //create an observable on the marker array
  private markerPositionsSource = new BehaviorSubject<GeoPoint[]>([]);
  markerPositions$ = this.markerPositionsSource.asObservable();

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
}