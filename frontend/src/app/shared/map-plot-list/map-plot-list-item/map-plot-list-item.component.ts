import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapPlot } from 'src/app/core/models/map-plot';

import mgrs from 'mgrs';


@Component({
    selector: 'app-map-plot-list-item',
    templateUrl: './map-plot-list-item.component.html',
    styleUrls: ['./map-plot-list-item.component.scss']
})

export class MapPlotListItemComponent implements OnInit {

    @Input() plots: MapPlot[] | null;
    @Input() title: string;
    
    @Output() visibilityEvent = new EventEmitter<MapPlot>();
    @Output() deleteEvent = new EventEmitter<number>();
    @Output() itemClickEvent = new EventEmitter<number>();
    constructor() { }

    ngOnInit(): void {
    }

    onToggleVisibility(plot: MapPlot) {
        this.visibilityEvent.emit(plot);
    }

    onItemClick(plotId: number) {
        this.itemClickEvent.emit(plotId);
    }

    onDelete(plotId: number) {
        this.deleteEvent.emit(plotId);
    }

}
