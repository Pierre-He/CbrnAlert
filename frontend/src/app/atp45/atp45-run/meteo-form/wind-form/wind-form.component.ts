import { Component, Input, Output } from '@angular/core';
import { FormControl, FormRecord, Validators } from '@angular/forms';
import { FormGroup } from '@ngneat/reactive-forms';
//import { EventEmitter } from 'stream';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-wind-form',
  templateUrl: './wind-form.component.html',
  styleUrls: ['./wind-form.component.scss']
})
export class WindFormComponent {
  @Input() disabled = false;
  // @Input() parentForm: FormGroup<MeteoForm>;
  @Input() parentForm: FormRecord;

  //to manage the wind values for the atp 45 message
  @Output() windDataChange = new EventEmitter<{speed: number, azimuth: number}>();

  windForm = new FormGroup({
    // windForm = new FormGroup<WindForm>({
    speed: new FormControl(0, [Validators.required]),
    azimuth: new FormControl(0, [Validators.required]),
  });

  get speedValue(): number {
    return this.windForm.get('speed')?.value ?? 0;
  }

  get azimuthValue(): number {
    return this.windForm.get('azimuth')?.value ?? 0;
  }


  constructor() {}

  ngOnInit(): void {
    this.parentForm.addControl('wind', this.windForm);

    this.windForm.valueChanges.subscribe(() => {
      this.emitWindData();
    });
    
    //check for negatives input and transform them to 0
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

  emitWindData() {
    this.windDataChange.emit({
      speed: this.speedValue,
      azimuth: this.azimuthValue,
    });
  }

  isValid(): boolean {
    return this.windForm.valid;
  }

  ngOnDestroy(): void {
    this.parentForm.removeControl('wind');
  }
}
