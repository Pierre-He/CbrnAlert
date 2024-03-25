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
  beta: string = "Value for beta";

  // Function to send the data
  sendData(): void {
    const payload = {
      message: this.message,
      alpha: this.alpha,
      beta: this.beta
    };

    this.http.post('http://localhost:8000/api/updateHazardZone', payload)
      .subscribe({
        next: (response) => console.log('Data sent successfully', response),
        error: (error) => console.error('Error sending data', error)
      });
  }
  
}