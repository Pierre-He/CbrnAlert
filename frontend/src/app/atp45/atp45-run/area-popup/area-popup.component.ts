import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Atp45Service } from '../../atp45.service';
@Component({
  selector: 'app-area-popup',
  templateUrl: './area-popup.component.html',
  styleUrls: ['./area-popup.component.scss']
})
export class AreaPopupComponent implements OnInit{

  constructor(
    private http: HttpClient,
    private atp45Service: Atp45Service
    ) { }

    ngOnInit(): void {
    
    }
    

  // Example variables
  message: string = "Predefined message";
  alpha: string = "Value for alpha";
  delta: string = "Value for delta";
  foxtrot: string = "foxtrot";
  golf: string = "golf";
  india: string = "india";
  miker: string = "miker";
  papaa: string = "papaa";
  papax: string = "papax";
  tango: string = "tango";
  gentext: string = "gentext";

 //ALFA Incident Serial Number 
//BRAVO Location of Observer and Direction of incident

  // Function to stash the popup message to the Service who will be called by Atp45-run.
  prepareData(): void {
    const payload = {
      message: this.message,
      alpha: this.alpha,
      delta: this.delta,
      foxtrot: this.foxtrot,
      golf: this.golf,
      india: this.india,
      miker: this.miker,
      papaa: this.papaa,
      papax: this.papax,
      tango: this.tango,
      gentext: this.gentext
      
    };
  }
}