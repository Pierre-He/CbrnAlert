import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private dualMarkerMode = new BehaviorSubject<boolean>(false);
  dualMarkerMode$ = this.dualMarkerMode.asObservable();

  toggleDualMarkerMode() {
    this.dualMarkerMode.next(!this.dualMarkerMode.value);
  }
}