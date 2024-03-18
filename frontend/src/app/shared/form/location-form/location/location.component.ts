import { AbstractControl, NgControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { Component, forwardRef, OnDestroy, Optional, Self } from '@angular/core';
import { first, skip } from 'rxjs/operators';
import { MapState, MapAction } from 'src/app/core/state/map.state';
import { GeoPoint } from 'src/app/core/api/models';
import { ControlValueAccessor, FormControl, FormGroup } from '@angular/forms';
import { MarkerService } from 'src/app/core/services/marker.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ControlsOf } from 'src/app/shared/form/controls-of';
// interface Locations {
//     locations: FormArray<GeoPoint>
// }
@Component({
    selector: 'app-location',
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss'],
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => LocationComponent),
        multi: true,
      },
      {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => LocationComponent),
        multi: true,
      },
    ],
})
export class LocationComponent implements ControlValueAccessor, OnDestroy, Validator {

    value: GeoPoint = { lon: 0., lat: 0. };


    form = new FormGroup({
        lon: new FormControl(0, {nonNullable: false, validators: [wrongLonValidator, Validators.required]}),
        lat: new FormControl(0, {nonNullable: false, validators: [wrongLatValidator, Validators.required]})
    })

    markerSub: Subscription;
    statusSub: Subscription;

    touched = false;

    disabled = false;

    onChange = (value: GeoPoint) => { };

    onTouched = () => { };

    onValidationChange = () => {};

    onChangeSubs: Subscription[] = [];

    //boolean for the toggle dual-markers
    dualMarkerMode: boolean = false;

    @Select(MapState.userPoint) marker$: Observable<GeoPoint>;
    

    constructor(
        public store: Store,
        public markerService: MarkerService,
        public snackBar : MatSnackBar
        // @Self() @Optional() private control: NgControl
    ) {
      // this.control.valueAccessor = this;

       // auto fill form
    this.markerSub = this.marker$.subscribe((marker) => {
        this.setMarker(marker);
      });

      this.markerService.dualMarkerMode$.subscribe(isDualMode => {
        



        // Adjust the form auto-completion logic based on isDualMode
        // E.g., if isDualMode is true, fill in both location inputs without auto-clearing
      });
    }

    // public get invalid(): boolean {
    //   return this.form.invalid
    // }

    // public get valid(): boolean {
    //   return !this.invalid
    // }

    // ngOnInit(): void {
    // }
    setMarker(marker: GeoPoint) {
            if (marker !== undefined) {
                this.form.setValue(marker);
            }
    }

    setFromMarker() {
        /* this.marker$.pipe(
            first(),
        ).subscribe(
            marker => this.setMarker(marker)
        ) */

        const latestPosition = this.markerService.getLatestMarkerPosition();
        if (latestPosition) {
            this.form.patchValue({
                lon: latestPosition.lon,
                lat: latestPosition.lat,
            });
            alert("inside if to update");
        } else {
            alert("No latest marker position found.");
        }
    }

    setFromMapClick() {
        this.marker$.pipe(
            skip(1),
            first(),
        ).subscribe(
            marker => this.setMarker(marker)
        )
    }

    onEnter() {
        const value = this.form.value
        if (value !== undefined) {
            this.store.dispatch(new MapAction.ChangeMarker(value as GeoPoint))
        }
    }

    writeValue(value: GeoPoint) {
        if (value) {
            this.form.setValue(value, { emitEvent: false });
        }
    }

    registerOnChange(onChange: any) {
        const sub = this.form.valueChanges.subscribe(onChange);
        this.onChangeSubs.push(sub);
    }

    registerOnTouched(onTouched: any) {
        this.onTouched = onTouched;
    }

    markAsTouched() {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }

    setDisabledState(disabled: boolean) {
        this.disabled = disabled;
    }

    validate(control: AbstractControl): ValidationErrors | null {
      const isIncorrect = this.form.invalid;

      return isIncorrect ? { invalidLocation: {wrongLon: this.getErrors('lon'), wrongLat: this.getErrors('lat')} } : null;
    }

    getErrors(name:string) {
      return this.form.get(name)!.errors
    }
    ngOnDestroy() {
        for (let sub of this.onChangeSubs) {
            sub.unsubscribe();
        }
    }

    //Methods for the dual Marker mode toggle
    toggleDualMarkerMode(): void {
        this.dualMarkerMode = !this.dualMarkerMode;
        
    }

    //simple test with an alert for the method above
    toggleModeAndShowAlert(): void {
        this.markerService.toggleDualMarkerMode();
        this.markerService.dualMarkerMode$.subscribe(isDualMode => {
          alert(`Dual Marker Mode is now: ${isDualMode ? 'ON' : 'OFF'}`);

        }).unsubscribe(); // Immediately unsubscribe to prevent memory leaks for this one-time operation.
    }

    toggleModeAndSnackBar():void {
        this.markerService.clearAllMarkers();
        alert("toggled from location");
        this.markerService.toggleDualMarkerMode();
        this.markerService.dualMarkerMode$.subscribe(isDualMode => {
            this.snackBar.open(`Dual Marker Mode is now: ${isDualMode ? 'ON' : 'OFF'}`,'Close',{
                duration:3000,
            });
  
        }).unsubscribe();
    }

    
}

let lonLatFormat = /^-?\d{1,3}[,|.]?\d*$/gm;

export function wrongLatValidator(control: AbstractControl): ValidationErrors | null {
    // const val = control.value.toString();
    const val = control.value;

    // if (!val.match(lonLatFormat)) {
    //     return { wrongFormat: { value: val } };
    // }
    if (parseFloat(val) < -90. || parseFloat(val) > 90.) {
        return { valOutOfBound: { value: val } };
    }
    return null;
}

export function wrongLonValidator(control: AbstractControl): ValidationErrors | null {
    // const val = control.value.toString();
    const val = control.value;
    // if (!val.match(lonLatFormat)) {
    //     return { wrongFormat: { value: val } };
    // }
    if (parseFloat(val) < -180. || parseFloat(val) > 180.) {
        return { valOutOfBound: { value: val } };
    }
    return null;
}
