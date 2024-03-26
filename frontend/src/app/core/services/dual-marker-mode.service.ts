import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ 
    providedIn: 'root' 
})

//this service allows the control of the dual marker mode
export class DualMarkerModeService {

    //the main variable that is checked
    private _dualMarkerMode = new BehaviorSubject<boolean>(false);

    //the observable linked to the variable that other components subscribes to
    public dualMarkerMode$ = this._dualMarkerMode.asObservable();

    constructor() {}

    //the variable toggle to true
    enableDualMarkerMode(){
        this._dualMarkerMode.next(true);
    }

    //the variable toggle to false
    disableDualMarkerMode(){
        this._dualMarkerMode.next(false);
    }

    //check for which state the variable is
    isDualMarkerModeEnabled(): boolean {
        return this._dualMarkerMode.value;
    }

}