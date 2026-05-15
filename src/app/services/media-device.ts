import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MediaDevice {
  readonly videoDevices = signal<MediaDeviceInfo[]>([]);
  readonly error = signal<string | null>(null);

  constructor() {
    navigator.mediaDevices.ondevicechange = () => this.checkAndLoadDevices();
  }

  async checkAndLoadDevices(): Promise<void> {
    let stream: MediaStream | null = null;

    try {
      let cameras = await this.cameras();

      if (!this.labels(cameras)) {
        stream = await this.videoStream();
        cameras = await this.cameras();
      }

      this.videoDevices.set(cameras);
      this.error.set(null);

    } catch(err: any) {
      this.error.set(err.message || 'Access denied to media devices');
      console.error('Media Device Error:', err);
    } finally {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('Temporary camera check stream stopped.');
      }
    }
  }

  private async videoStream(): Promise<MediaStream | null> {
    return navigator.mediaDevices.getUserMedia({ video: true });
  }

  private async cameras(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    return cameras;
  }

  private labels(cameras: MediaDeviceInfo[]): boolean {
    return cameras.length > 0 && cameras.every(c => c.label !== '');
  }



}
