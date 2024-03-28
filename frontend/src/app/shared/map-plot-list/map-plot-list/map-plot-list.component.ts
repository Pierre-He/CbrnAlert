import { MapPlotState } from './../../../core/state/map-plot.state';
import { Observable, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MapPlot } from 'src/app/core/models/map-plot';
import { Select, Store } from '@ngxs/store';
import { MapPlotAction } from 'src/app/core/state/map-plot.state';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PlotDetailsDialogComponent } from '../plot-details-dialog/plot-details-dialog.component';



@Component({
    selector: 'app-map-plot-list',
    templateUrl: './map-plot-list.component.html',
    styleUrls: ['./map-plot-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })

export class MapPlotListComponent {
    @Select(MapPlotState.filterType('atp45')) atp45Plots$: Observable<MapPlot[]>
    @Select(MapPlotState.filterType('flexpart')) flexpartPlots$: Observable<MapPlot[]>


    constructor(
        private store: Store,
        public dialog: MatDialog,
    ) { }

    toggleVisibility(plot: MapPlot) {
        plot.visible ? this.store.dispatch(new MapPlotAction.Hide(plot.id)) : this.store.dispatch(new MapPlotAction.Show(plot.id));

    }

    setActive(plotId: number) {
        this.store.dispatch(new MapPlotAction.SetActive(plotId));
        this.openDialog(plotId + 1)
    }

    delete(plotId: number) {
        this.store.dispatch(new MapPlotAction.Remove(plotId));
    }

    openDialog(plotId:number): void {



        this.dialog.open(PlotDetailsDialogComponent, {
          width: '300px',
          data: { 
            plotId,
            alpha:' alpha',
            delta: 'delta',
            foxtrot: 'foxtrot',
            golf: 'golf',
            india: 'india',
            miker: 'miler',
            papaa: 'papaa',
            papax: 'papax',
            gentext: 'gentext'
            }
        });



    }
}
