import { FormGroup, FormRecord } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { Atp45Service } from '../../atp45.service';
import { Atp45StabilityClasses } from 'src/app/core/api/models';

@Component({
  selector: 'app-meteo-form',
  templateUrl: './meteo-form.component.html',
  styleUrls: ['./meteo-form.component.scss']
})
export class MeteoFormComponent {

  @Input() withWind: boolean = true;
  @Input() withStability: boolean = true;
  @Input() parentForm: FormRecord;

  constructor(private atp45Service: Atp45Service){}

  meteoForm = new FormRecord({})
  // meteoForm = new FormGroup<MeteoForm>({})
  ngOnInit(): void {
    this.parentForm.addControl('weather', this.meteoForm);
  }

  isValid(): boolean {
    return this.meteoForm.valid;
  }

  ngOnDestroy(): void {
    this.parentForm.removeControl('weather');
  }
  
  //storing wind data for the service
  handleWindDataChange(windData: { speed: number, azimuth: number }) {
    this.atp45Service.setWindData(windData);
  }

  //storing the stability type for the service
  handleStabilityClassChange(stabilityClass: Atp45StabilityClasses) {
    this.atp45Service.setStabilityClass(stabilityClass);
  }
}
