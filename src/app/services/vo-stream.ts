import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Subject } from 'rxjs';

export interface TrajectoryCoords {
  x: number;
  y: number;
  z: number;
}

@Injectable({
  providedIn: 'root'
})
export class VoStreamService {
  private ws: WebSocket | null = null;
  
  private coordsSubject = new Subject<TrajectoryCoords>();
  coords$ = this.coordsSubject.asObservable();
  
  private readyForNextFrameSubject = new Subject<void>();
  readyForNextFrame$ = this.readyForNextFrameSubject.asObservable();

  connect(url: string = environment.voBackendWsUrl) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to Python VO Backend');
      this.readyForNextFrameSubject.next(); 
    };

    this.ws.onmessage = (event) => {
      const coords: TrajectoryCoords = JSON.parse(event.data);
      this.coordsSubject.next(coords);
      this.readyForNextFrameSubject.next(); 
    };

    this.ws.onclose = () => console.log('WebSocket connection closed');
    this.ws.onerror = (error) => console.error('WebSocket error:', error);
  }

  sendFrame(frameData: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(frameData);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}