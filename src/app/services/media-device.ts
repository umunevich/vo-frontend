import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MediaDevice {
  private videoDevicesSubject = new BehaviorSubject<MediaDeviceInfo[]>([]);
  videoDevices$ = this.videoDevicesSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  async checkAndLoadDevices() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');

      this.videoDevicesSubject.next(cameras);
      this.errorSubject.next(null);

      stream.getTracks().forEach(track => track.stop());
    } catch(err: any) {
      this.errorSubject.next(err.message || 'Access denied');
      console.error('Media Device Error:', err);
    }
  }

  getVideoDevices(): Observable<MediaDeviceInfo[]> {
    return this.videoDevices$;
  }
}
