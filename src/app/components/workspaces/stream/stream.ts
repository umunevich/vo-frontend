import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { VoFormData } from '@services/vo-form-data';
import { VoStreamService, TrajectoryCoords } from '@services/vo-stream';
import { Subscription } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-stream-workspace',
  standalone: true,
  imports: [DragDropModule],
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
    private voFormData: VoFormData,
    @Inject(VoStreamService) private streamService: VoStreamService
  ) {}

  ngOnInit(): void {
    this.initPlot();
    this.setupNetworkListeners();
    this.startVideo().then(() => {
      this.streamService.connect(this.voFormData.selectedConfigId());
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
    const selectedDevice = this.voFormData.selectedDevice();
    if (selectedDevice) {
      try {
        const constraints = {
          video: { 
            deviceId: { exact: selectedDevice.deviceId },
            width: { ideal: 640 },
            height: { ideal: 480 } 
          }
        };
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = this.videoElement.nativeElement;
        video.srcObject = this.stream;

        video.onloadedmetadata = () => {
          requestAnimationFrame(() => this.extractAndSendFrame());
        };

      } catch (err) {
        console.error("Failed to access camera: ", err);
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
      line: { color: 'red', width: 2 },
      name: 'Live Trajectory'
    };

    const layout: Partial<Plotly.Layout> = {
      margin: { l: 0, r: 0, b: 0, t: 0 },
      scene: {
        xaxis: { title: { text: 'X (Right)' } },
        yaxis: { title: { text: 'Y (Down)' } },
        zaxis: { title: { text: 'Z (Forward)' } }
      }
    };

    const config: Partial<Plotly.Config> = { responsive: true };

    Plotly.newPlot(this.plotElement.nativeElement, [trace], layout, config);
  }

  extractAndSendFrame() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    if (video.videoWidth === 0 || video.readyState < video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(() => this.extractAndSendFrame());
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const frameData = canvas.toDataURL('image/jpeg', 0.6);
    
    this.streamService.sendFrame(frameData); 
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.streamService.disconnect();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}