import { Component, OnDestroy, OnInit, WritableSignal } from '@angular/core';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { VoData } from '@services/vo-data';
import { MediaDevice } from '@services/media-device';

@Component({
  selector: 'app-stream-tab',
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
  ],
  templateUrl: './stream-tab.html',
  styleUrl: './stream-tab.css',
})
export class StreamTab implements OnInit {
  videoDevices: WritableSignal<MediaDeviceInfo[]>
  selectedDevice: MediaDeviceInfo | null = null

  constructor(
    private voData: VoData,
    private mediaDevice: MediaDevice
  ) {
    this.videoDevices = this.mediaDevice.videoDevices;
  }

  ngOnInit(): void {
    this.mediaDevice.checkAndLoadDevices();
  }

  onCameraSelect(camera: MediaDeviceInfo) {
    this.selectedDevice = camera;
    this.voData.selectedDevice.set(camera);
  }
}
