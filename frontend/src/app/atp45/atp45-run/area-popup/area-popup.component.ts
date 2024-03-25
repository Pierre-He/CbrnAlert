import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-area-popup',
  templateUrl: './area-popup.component.html',
  styleUrls: ['./area-popup.component.scss']
})
export class AreaPopupComponent {

  constructor(private http: HttpClient) { }

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

  // Function to send the data
  sendData(): void {
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

    this.http.post('http://localhost:8000/api/updateHazardZone', payload)
      .subscribe({
        next: (response) => console.log('Data sent successfully', response),
        error: (error) => console.error('Error sending data', error)
      });
  }
  
}