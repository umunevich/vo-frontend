import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VoData {
  selectedDevice: MediaDeviceInfo | null = null
  selectedFile: File | null = null

  isReady(mode: 'stream' | 'file'): boolean {
    return mode === 'stream' ? this.selectedDevice !== null : this.selectedFile !== null;
  }
}
