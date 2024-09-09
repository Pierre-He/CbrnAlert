import { Atp45Result } from './../api/models/atp-45-result';
import { GeoJsonSliceResponse } from './../api/models/geo-json-slice-response';
import { Injectable } from '@angular/core';
import { MapPlot, PlotType } from '../models/map-plot';
import { MapService } from './map.service';
import { Feature, FeatureCollection } from 'geojson';
import { ColorbarData } from '../api/models';
import { circle, circleMarker, FeatureGroup, geoJSON, LayerGroup } from 'leaflet';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import chroma from 'chroma-js';


const POINT_MARKER_OPTIONS = {
  radius: 2,
  fillColor: "black",
  color: "black",
  weight: 1,
  opacity: 1,
  fillOpacity: 1
};

const REL_LOC_MARKER_OPTIONS = {
  radius: 5,
  fillColor: "red",
  color: "red",
  weight: 4,
  opacity: 1,
  fillOpacity: 1
};

function getColor(value: number, colorbar: ColorbarData) {
  let ticks = colorbar.ticks as number[];
  let colors = colorbar!.colors as string[];
  let n = ticks.length;
  if (value <= ticks[0]) {
    return colors[0];
  }
  for (let i = 1; i < n; i++) {
    if (value <= ticks[i]) {
      return colors[i - 1];
    }
  }
  return colors[n - 2];
}

@Injectable({
  providedIn: 'root'
})
export class MapPlotsService {

  constructor(
    private mapService: MapService,
  ) { }

  fillPlotGeoJSON(plotData: Atp45Result | GeoJsonSliceResponse, type: PlotType) {
    let newPlot = new MapPlot(type);
    newPlot.metadata = plotData.metadata;
    newPlot.geojson = plotData.collection as FeatureCollection;
    return newPlot;
  }

  async fillPlotTiff(plotData: Blob, type: PlotType) {
    const arrayBuffer = await plotData.arrayBuffer();
    const geoRaster = await parseGeoraster(arrayBuffer);
    let newPlot = new MapPlot(type);
    newPlot.data = geoRaster;
    newPlot.metadata = this._colorbarFromGeoRaster(geoRaster);
    return newPlot;
  }

  addTiff(geoRaster: any) {
    const activity = 3.215; // kBq in 1 ng of caesium-137
    const scale = this._colorScale_depo(); // or _colorScale_mr based on logic
    const ticks = this._generateTicks(); // Generate ticks based on geoRaster

    const imageryLayer = new GeoRasterLayer({
      georaster: geoRaster,
      pixelValuesToColorFn: pixelValues => {
        let pixelValue = pixelValues[0] * activity; // Assuming single-band raster
        if (pixelValue === 0) return '';
        return scale(pixelValue).hex();
      },
      resolution: 256,
      opacity: 0.8
    });

    return imageryLayer;
  }

  _colorScale_mr() {
    return chroma.scale('Spectral');
  }

  _colorScale_depo() {
    return chroma.scale(['#800000', '#F0E68C']); // Adjust based on needs
  }

  _colorbarFromGeoRaster(geoRaster: any): ColorbarData {
    const activity = 3.215; // kBq in 1 ng of caesium-137
    const min = geoRaster.mins[0] * activity;
    const max = geoRaster.maxs[0] * activity;
    const ticks = [0, 2, 4, 10, 20, 40, 100, 185, 555, 1480]; // Based on deposition in kBq/m^2
    const scale = this._colorScale_depo().domain(ticks.slice().reverse());

    const colors = ticks.map(tick => scale(tick).hex());

    return {
      colors,
      ticks
    };
  }

  setColors(layers: LayerGroup, colorbar: ColorbarData) {
    layers.eachLayer((layer: any) => {
      let val = layer.feature.properties.val;
      if (val !== undefined) {
        layer.setStyle({
          color: getColor(val, colorbar),
        });
      }
    });
  }

  _generateTicks(): number[] {
    // Logic to generate ticks based on geoRaster data
    return [0, 2, 4, 10, 20, 40, 100, 185, 555, 1480];
  }

  flexpartPlotToLayer(collection: FeatureCollection) {
    let layers = geoJSON(undefined, {
      pmIgnore: true
    });
    let featureGroup = new FeatureGroup();
    layers.addData(collection as FeatureCollection);
    featureGroup.addLayer(layers);
    return featureGroup;
  }
  atp45PlotToLayer(collection: FeatureCollection) {
    let options: L.GeoJSONOptions = {
      pointToLayer: function (feature: any, latlng: L.LatLng) {
        if (feature.properties.type === "releasePoint") {
          return circleMarker(latlng, REL_LOC_MARKER_OPTIONS);
        }
        return circleMarker(latlng, POINT_MARKER_OPTIONS);
      },
      style: (feature: any) => {
        let options: L.PathOptions = {
          // stroke: false,
          fillOpacity: 0.4,
        }
        options = feature.properties.type == "release" ? { ...options, color: "red" } : options
        return options;
      },
    };
    let geojson = geoJSON(undefined, {
      pmIgnore: true,
      ...options
    });
    let featureGroup = new FeatureGroup()
    geojson.addData(collection as FeatureCollection);
    featureGroup.addLayer(geojson)
    // return layers as LayerGroup
    return featureGroup
  }


  createMapPlotGeoJSON({ type, plotData }: any) {
    let mapPlot = this.fillPlotGeoJSON(plotData, type)
    return mapPlot;
  }

  createMapPlotTiff({ type, plotData }: any) {
    let mapPlot = this.fillPlotTiff(plotData, type)
    return mapPlot;
  }
}
