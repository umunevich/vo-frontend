import { Component, OnInit, WritableSignal } from '@angular/core';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { VoFormData } from '@services/vo-form-data';
import { MediaDevice } from '@services/media-device';
import { CameraProfileControls } from '@components/shared/camera-profile-controls/camera-profile-controls';

@Component({
  selector: 'app-stream-tab',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    CameraProfileControls,
  ],
  templateUrl: './stream-tab.html',
  styleUrl: './stream-tab.css',
})
export class StreamTab implements OnInit {
  videoDevices: WritableSignal<MediaDeviceInfo[]>;

  constructor(
    private voFormData: VoFormData,
    private mediaDevice: MediaDevice,
  ) {
    this.videoDevices = this.mediaDevice.videoDevices;
  }

  ngOnInit(): void {
    this.mediaDevice.checkAndLoadDevices();
  }

  onCameraSelect(camera: MediaDeviceInfo): void {
    this.voFormData.selectedDevice.set(camera);
  }
}
