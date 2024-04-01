import { Component, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormRecord } from '@angular/forms';
import { Atp45StabilityClasses } from 'src/app/core/api/models';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-stability-form',
  templateUrl: './stability-form.component.html',
  styleUrls: ['./stability-form.component.scss']
})
export class StabilityFormComponent {

  @Input() parentForm: FormRecord;
  @Output() stabilityClassChange = new EventEmitter<Atp45StabilityClasses>();


  stabilityClasses = Object.values(Atp45StabilityClasses)

  stabilityForm = new FormGroup({
    // windForm = new FormGroup<WindForm>({
    stabilityClass: new FormControl(Atp45StabilityClasses.Stable, {nonNullable: true}),
  });

  ngOnInit(): void {
    this.parentForm.addControl('stability', this.stabilityForm);

    this.stabilityForm.get('stabilityClass')!.valueChanges.subscribe(value => {
      this.stabilityClassChange.emit(value);
    });
  }

  isValid(): boolean {
    return this.stabilityForm.valid;
  }

  ngOnDestroy(): void {
    this.parentForm.removeControl('stability');
  }

}
