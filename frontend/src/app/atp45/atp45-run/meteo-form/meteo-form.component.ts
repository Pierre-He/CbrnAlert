import { FormGroup, FormRecord } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { Atp45Service } from '../../atp45.service';


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

  handleWindDataChange(windData: { speed: number, azimuth: number }) {
    // Handle the wind data as needed, e.g., storing it in the service
    this.atp45Service.setWindData(windData);
  }
}
