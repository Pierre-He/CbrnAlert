import { Atp45ApiService } from 'src/app/core/api/services';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Atp45ShapeData } from './shape-data';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { formatDate } from '@angular/common';
import { FeatureCollection } from 'geojson';
import { ForecastAvailableSteps } from '../core/api/models';
import { ForecastStartAction } from 'src/app/core/state/atp45.state';
import { Store } from '@ngxs/store';

@Injectable({
    providedIn: 'root',
})
export class Atp45Service {
    availableForecastSubject = new BehaviorSubject<ForecastAvailableSteps | null>(null);
    availableForecast$ = this.availableForecastSubject.asObservable();

    //for the messages of map plot list items
    private selectedCaseIdsSource = new BehaviorSubject<string>('');
    selectedCaseIds$ = this.selectedCaseIdsSource.asObservable();
    
    


    constructor(
        private apiService: Atp45ApiService,
        private store: Store,
        private http: HttpClient,
    ) { }


    /**
     * @param  {any} shapeData
     * @returns Atp45ShapeData
     */
    responseToShapeData(shapeData: any): Atp45ShapeData {
        let shapes = <FeatureCollection>shapeData.shapes;
        shapeData.datetime = new Date(shapeData.datetime);
        let speed = Math.round(shapeData.wind.speed * 3.6 * 10) / 10;

        for (const feature of shapes.features) {
            if (!feature.properties) { break; }
            feature.properties.text = `
                <b>${feature.properties.label}</b><br>
                <b>Coordinates : (${shapeData.lat}, ${shapeData.lon})</b><br>
                wind speed = ${speed} km/h<br>
                date = ${formatDate(shapeData.datetime, 'yyyy-MM-dd', 'en-US')}<br>
                time = ${formatDate(shapeData.datetime, 'HH:mm', 'en-US')}<br>
                step = ${shapeData.step}`;
        }

        return shapeData;
    }

    getAvailableSteps() {
      // only get the available once
      this.apiService.forecastAvailableGet().subscribe(res => {
        this.store.dispatch(new ForecastStartAction.Update(res));
        this.availableForecastSubject.next(res)
      })
    }

    setSelectedCaseIds(ids: string) {
      this.selectedCaseIdsSource.next(ids);
      this.processSelectedIds(ids);
    }

    private processSelectedIds(ids: string) {
      const idMap = this.createIdMap(ids);
      this.handleCommonLogic(idMap);
      if (idMap.get('detailed') || false) {
          this.handleDetailedLogic(idMap);
      }
    }

    private createIdMap(ids: string): Map<string, boolean> {
      const idArray = ids.split('-');
      const idMap = new Map<string, boolean>();
      idArray.forEach(id => idMap.set(id, true));
      return idMap;
    }

    //check for wind and attack type, note that the two attacks below aren't implemented yet
    handleCommonLogic(idMap:Map<string,boolean>) {
      let isChemical = idMap.get("chem")|| false;
      let isBiological = idMap.get("bio")|| false;
      let isRadioactive = idMap.get("radio")|| false;
      let isNuclear = idMap.get("nuke")|| false;
      
      console.log(`Is Chemical: ${isChemical}`);
      console.log(`Is Biological: ${isBiological}`);
      console.log(`Is Radioactive: ${isRadioactive}`);
      console.log(`Is Nuclear: ${isNuclear}`);
    }
    
    handleDetailedLogic(idMap:Map<string,boolean>) {
      let isNonPersistent = idMap.get("typeA") || false;
      let isPersistent = idMap.get("typeB")|| false;
      //let persistenceType = idMap.get('typeB') ? 'B' : 'A';

      const containerGroupKey = Array.from(idMap.keys()).find(key => key.startsWith('containergroup'));
      
      console.log(`Is Non-Persistent: ${isNonPersistent}`);
      console.log(`Is Persistent: ${isPersistent}`);
      console.log(`Container Group Key: ${containerGroupKey}`);
    }
    

}
