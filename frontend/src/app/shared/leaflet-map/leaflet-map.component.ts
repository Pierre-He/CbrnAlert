import { FeatureCollection } from 'geojson';
import { MapAction } from 'src/app/core/state/map.state';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { circle, Control, Icon, icon, latLng, Layer, Map, marker, Marker, polygon, Rectangle, tileLayer } from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
// import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { MapService } from 'src/app/core/services/map.service';
import { Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { MapPlotState } from 'src/app/core/state/map-plot.state';
import { MapPlot } from 'src/app/core/models/map-plot';
import { map, tap } from 'rxjs/operators';
import { MapPlotsService } from 'src/app/core/services/map-plots.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeafletMapComponent implements OnInit {


  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 1,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }),
    ],
    zoom: 8,
    center: latLng(50.82, 4.35),
  };

  // plotLayers: Observable<Layer[]>
  @Select(MapPlotState.mapPlots) mapPlots$: Observable<MapPlot[]>;
  @Select(MapPlotState.activePlot) activePlot$: Observable<MapPlot>;

  // legend = new Control({ position: 'bottomright' });
  layersControl = {
    baseLayers: {
      'Open Street Map': tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      'Open Cycle Map': tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    },
    overlays: {}
  }

  // layers$: Observable<Layer[]>;

  // layers$: Observable<Layer[]> = of([
  //   circle([ 46.95, 4 ], { radius: 5000 }),
  //   polygon([[ 46.8, 4 ], [ 46.92, 5 ], [ 46.87, 4 ]]),
  //   marker([ 46.879966, 4 ])
  // ]);

  constructor(
    public mapService: MapService,
    public mapPlotsService: MapPlotsService,
    public store: Store
  ) {
  }

  ngOnInit(): void { }

  onMapReady(map: Map) {
    this.mapService.leafletMap = map;
    map.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
      editMode: false,
    });
    map.pm.enableDraw('Marker', { continueDrawing: false });
    map.pm.disableDraw();
    map.pm.setGlobalOptions({
      markerStyle: {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png'
        })
      }
    })

    map.on('pm:create', (e) => {
      if (e.shape == 'Rectangle') {
        const newLayer = e.layer as Rectangle
        const previousLayer = this.mapService.drawnRectangle;

        if (previousLayer) {
          this.store.dispatch(new MapAction.ChangeAreaSelection(this.mapService.rectangleToArea(newLayer)));
          this.mapService.leafletMap.removeLayer(newLayer)
        } else {
          this.mapService.drawnRectangle = newLayer
          this.store.dispatch(new MapAction.ChangeAreaSelection(this.mapService.rectangleToArea(newLayer)));
          this.mapService.drawnRectangle.on('pm:edit', (e: any) => {
            this.store.dispatch(new MapAction.ChangeAreaSelection(this.mapService.rectangleToArea(e.layer as Rectangle)));
          })
        }
        this.createPopup(newLayer,'Rectangle')

      } else if (e.shape == 'Marker') {
        // Change the current marker if exists, and create it if not
        const newLayer = e.layer as Marker
        const previousLayer = this.mapService.drawnMarker;


        // Compromise : Allow the good functionning eraser at the expense of Location gather...
        //newLayer.addTo(this.mapService.leafletMap);
        
        if (previousLayer) {
          // this.mapService.copyMarkerPosition(newLayer);
          alert("previousLayer TRUE")
          this.store.dispatch(new MapAction.ChangeMarker(this.mapService.markerToPoint(newLayer)));
          this.mapService.leafletMap.removeLayer(newLayer)
        } else {
          this.mapService.drawnMarker = newLayer
          alert("NO-OLD ADD first line appeared")
          this.store.dispatch(new MapAction.ChangeMarker(this.mapService.markerToPoint(e.layer as Marker)));
          //alert(" NO-OLD ADD second line appeared")
          this.mapService.drawnMarker.on('pm:edit', (e: any) => {
            this.store.dispatch(new MapAction.ChangeMarker(this.mapService.markerToPoint(e.layer as Marker)));
            alert(" MOVING third line appeared")
          })
        }
      
        //popup eraser
        this.createPopup(newLayer,'Marker')

      }
    })
    
    //global eraser
    map.on('pm:remove',(e)=> {
      const removedLayer = e.layer;

      //check if rectangle or not
      if (removedLayer instanceof Marker) {
        if (removedLayer === this.mapService.drawnMarker) {
          this.mapService.drawnMarker = undefined; 
        }
      } else if (removedLayer instanceof Rectangle) {

        if (removedLayer === this.mapService.drawnRectangle) {
          this.mapService.drawnRectangle = undefined; 
        }
      this.mapService.leafletMap.removeLayer(removedLayer);
      }
    })
  
  }
  private createPopup(newLayer: Layer, layerType:'Marker' | 'Rectangle'){
         // Create a button for the popup
        const removeButton = document.createElement('button');
        removeButton.innerText = 'Click to Remove';
        removeButton.addEventListener('click', () => {
          
          // Handle remove button click based on layer type
        if (layerType === 'Marker' && newLayer === this.mapService.drawnMarker) {
          this.mapService.drawnMarker = undefined; // Clear the reference
        } else if (layerType === 'Rectangle' && newLayer === this.mapService.drawnRectangle) {
          this.mapService.drawnRectangle = undefined; 
        }
          this.mapService.leafletMap.removeLayer(newLayer);
        });

        // Create a popup with the button
        const popupContent = document.createElement('div');
        popupContent.appendChild(removeButton);

        // Bind the popup to the marker
        newLayer.bindPopup(popupContent).openPopup();
  }

}

