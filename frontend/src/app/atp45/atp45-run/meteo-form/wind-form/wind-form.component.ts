import { Component, Input } from '@angular/core';
import { FormControl, FormRecord, Validators } from '@angular/forms';
import { FormGroup } from '@ngneat/reactive-forms';

@Component({
  selector: 'app-wind-form',
  templateUrl: './wind-form.component.html',
  styleUrls: ['./wind-form.component.scss']
})
export class WindFormComponent {
  @Input() disabled = false;
  // @Input() parentForm: FormGroup<MeteoForm>;
  @Input() parentForm: FormRecord;

  windForm = new FormGroup({
    // windForm = new FormGroup<WindForm>({
    speed: new FormControl(8, [Validators.required]),
    azimuth: new FormControl(45, [Validators.required]),
  });


  constructor() {}

  ngOnInit(): void {
    this.parentForm.addControl('wind', this.windForm);

    
    // Subscribe to value changes and convert negatives to 0
    this.windForm.get('speed').valueChanges.subscribe(value => {
      if (value !== null && value  !== undefined && value < 0) {
        this.windForm.get('speed').setValue(0);
      }
    });

    this.windForm.get('azimuth').valueChanges.subscribe(value => {
      if (value !== null && value  !== undefined && value < 0) {
        this.windForm.get('azimuth').setValue(0);
      }
    });


  }

  isValid(): boolean {
    return this.windForm.valid;
  }

  ngOnDestroy(): void {
    this.parentForm.removeControl('wind');
  }
}
