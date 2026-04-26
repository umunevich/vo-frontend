import { Component, OnInit } from '@angular/core';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { VoData } from '../../services/vo-data';
import { MediaDevice } from '../../services/media-device';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { C } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-stream-tab',
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    AsyncPipe
  ],
  templateUrl: './stream-tab.html',
  styleUrl: './stream-tab.css',
})
export class StreamTab implements OnInit {
  videoDevices$: Observable<MediaDeviceInfo[]>
  selectedDevice: MediaDeviceInfo | null = null

  constructor(
    private voData: VoData,
    private mediaDevice: MediaDevice
  ) {
    this.videoDevices$ = mediaDevice.getVideoDevices();
    this.selectedDevice = this.voData.selectedDevice;
  }

  ngOnInit() {
    this.mediaDevice.checkAndLoadDevices();
  }

  onCameraSelect(camera: MediaDeviceInfo) {
    this.selectedDevice = camera;
    this.voData.selectedDevice = camera;
  }
}
