import { ColorbarData } from './../../../core/api/models/colorbar-data';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-legend-colorbar',
  templateUrl: './legend-colorbar.component.html',
  styleUrls: ['./legend-colorbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendColorbarComponent implements OnInit {
  //@Input() colorbar: any; 
  @Input() colors: string[] = [];
  @Input() formatedTicks: string[] = [];
  @Input() units: string = 'kg';

  get unitLabel() {
    return this.units === 'kg' ? 'kg' : 'kBq / m²';
  }

  setUnit(unit: string) {
    this.units = unit;
    // Adjust the ticks and colors based on the selected unit
    if (unit === 'kg') {
      // Example: adjusting values for kg
      this.formatedTicks = this.formatedTicks.map(t => this.convertToKg(t));
    } else if (unit === 'kBq/m²') {
      // Example: adjusting values for Bq
      this.formatedTicks = this.formatedTicks.map(t => this.convertToBq(t));
    }
  }

  @Input() set colorbar(value: ColorbarData) {
    if (value) {
      this.formatedTicks = value.ticks.map(i => this.formatTick(i));
      this.colors = value.colors || [];
      //this.units = value.units || 'kg'; // Default to 'kg' if units are not provided
    }
  }
  

  // ticksLabels: string[];
  // colors: string[];
  // ticksLabels$: Observable<string[]>;
  // colors$: Observable<string[]>;

  constructor() { }

  ngOnInit(): void {
    // this.ticksLabels$ = of(this.colorbar).pipe(map(cb => cb.ticks!.map((e: number) => { return e.toExponential(2) })))
    // this.ticksLabels = this.colorbar.ticks!.map((e: number) => { return e.toExponential(2) });
    // this.colors = <string[]>this.colorbar.colors
    // this.colors$ = of(this.colorbar).pipe(map(cb => cb.colors as string[]))
  }

  formatTick(tick:number) {
    return tick.toExponential(2)
  }

  convertToKg(tick: string): string {
    // Convert the tick to kg (custom logic based on your needs)
    return tick; // Placeholder logic
  }

  convertToBq(tick: string): string {
    // Convert the tick to kBq/m² (custom logic based on your needs)
    return tick; // Placeholder logic
  }
}
