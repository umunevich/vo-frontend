import { Injectable, signal } from '@angular/core';

export interface MediaData {
  ready(mode: 'stream' | 'file'): boolean
}

@Injectable({
  providedIn: 'root',
})
export class VoFormData implements MediaData {
  readonly selectedDevice = signal<MediaDeviceInfo | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedConfigId = signal<string | null>(null);

  ready(mode: 'stream' | 'file'): boolean {
    const modeSelected =  mode === 'stream' ? this.selectedDevice() !== null : this.selectedFile() !== null;

    return modeSelected && this.selectedConfigId() !== null;
  }
}
