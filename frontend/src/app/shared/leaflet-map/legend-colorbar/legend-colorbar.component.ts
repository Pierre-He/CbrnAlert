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

  formatedTicks: string[];
  colors?: string[];

  units = 'ng/m³';
  @Input() set colorbar(value: ColorbarData) {
    this.formatedTicks = value.ticks.map(i => this.formatTick(i));
    this.colors = value.colors;
    // this.units = value.units;
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
}