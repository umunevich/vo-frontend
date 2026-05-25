import { Component, OnDestroy, OnInit } from '@angular/core';
import { VoData } from '../../../services/vo-data';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-stream-workspace',
  imports: [],
  templateUrl: './stream.html',
  styleUrl: './stream.css',
})
export class StreamWorkspace implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;

  constructor(private voData: VoData){}

  ngOnInit(): void {
    this.startVideo();
  }
  
  async startVideo() {
    if (this.voData.selectedDevice) {
      try {
        const constraints = {
          video: { deviceId: { exact: this.voData.selectedDevice()?.deviceId } }
        };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.videoElement.nativeElement.srcObject = this.stream;
      } catch (err) {
        console.error("Помилка доступу до камери: ", err);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
