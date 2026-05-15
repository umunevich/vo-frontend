import { Injectable, signal } from '@angular/core';

export interface MediaData {
  ready(mode: 'stream' | 'file'): boolean
}

@Injectable({
  providedIn: 'root',
})
export class VoData implements MediaData {
  readonly selectedDevice = signal<MediaDeviceInfo | null>(null);
  readonly selectedFile = signal<File | null>(null);

  ready(mode: 'stream' | 'file'): boolean {
    return mode === 'stream' ? this.selectedDevice() !== null : this.selectedFile() !== null;
  }
}
