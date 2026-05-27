import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { VoData } from '../../../services/vo-data';
import { VoStreamService, TrajectoryCoords } from '@services/vo-stream';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-stream-workspace',
  templateUrl: './stream.html',
  styleUrls: ['./stream.css'],
})
export class StreamWorkspace implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('plotElement', { static: true }) plotElement!: ElementRef<HTMLDivElement>;

  stream: MediaStream | null = null;
  
  trajectory = { x: [0], y: [0], z: [0] };
  private subs = new Subscription();

  constructor(
    private voData: VoData,
    @Inject(VoStreamService) private streamService: VoStreamService
  ) {}

  ngOnInit(): void {
    this.initPlot();
    
    this.setupNetworkListeners();

    this.startVideo().then(() => {
      this.streamService.connect();
    });
  }

  private setupNetworkListeners() {
    this.subs.add(
      this.streamService.coords$.subscribe((coords: TrajectoryCoords) => {
        this.trajectory.x.push(coords.x);
        this.trajectory.y.push(coords.y);
        this.trajectory.z.push(coords.z);

        Plotly.extendTraces(this.plotElement.nativeElement, {
          x: [[coords.x]], y: [[coords.y]], z: [[coords.z]]
        }, [0]);
      })
    );

    this.subs.add(
      this.streamService.readyForNextFrame$.subscribe(() => {
        requestAnimationFrame(() => this.extractAndSendFrame());
      })
    );
  }
  
  async startVideo() {
    if (this.voData.selectedDevice()) {
      try {
        const constraints = {
          video: { 
            deviceId: { exact: this.voData.selectedDevice()?.deviceId },
            width: { ideal: 640 },
            height: { ideal: 480 } 
          }
        };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.videoElement.nativeElement.srcObject = this.stream;
      } catch (err) {
        console.error("Помилка доступу до камери: ", err);
      }
    }
  }

  initPlot() {
    const trace: Plotly.Data = {
      x: this.trajectory.x,
      y: this.trajectory.y,
      z: this.trajectory.z,
      type: 'scatter3d',
      mode: 'lines+markers',
      marker: { size: 3, color: 'red' },
      line: { color: 'blue', width: 2 }
    };

    const layout: Partial<Plotly.Layout> = {
      margin: { l: 0, r: 0, b: 0, t: 0 },
      scene: {
        xaxis: { title: { text: 'X (m)' } },
        yaxis: { title: { text: 'Y (m)' } },
        zaxis: { title: { text: 'Z (m)' } }
      }
    };

    Plotly.newPlot(this.plotElement.nativeElement, [trace], layout);
  }

  extractAndSendFrame() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const frameData = canvas.toDataURL('image/jpeg', 0.6);
      
      this.streamService.sendFrame(frameData); 
    } else {
      requestAnimationFrame(() => this.extractAndSendFrame());
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.streamService.disconnect();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}