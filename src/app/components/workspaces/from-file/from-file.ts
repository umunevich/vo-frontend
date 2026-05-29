import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VoFormData } from '@services/vo-form-data';
import { VoStreamService, TrajectoryCoords } from '@services/vo-stream';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-from-file-workspace',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './from-file.html',
  styleUrl: './from-file.css',
})
export class FromFileWorkspace implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('frameCanvas', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('plotElement', { static: true }) plotElement!: ElementRef<HTMLDivElement>;

  isProcessing: boolean = false;
  videoUrl: string | null = null;
  trajectory = { x: [0], y: [0], z: [0] };
  
  private subs = new Subscription();

  constructor(
    private voFormData: VoFormData,
    @Inject(VoStreamService) private streamService: VoStreamService
  ) {}

  ngOnInit() {
    this.initPlotly();
    this.setupNetworkListeners();
    this.loadVideoFile();
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
        const video = this.videoElement.nativeElement;
        
        if (this.isProcessing && !video.paused && !video.ended) {
          requestAnimationFrame(() => this.extractAndSendFrame());
        } else if (video.ended) {
          this.stopProcessing();
        }
      })
    );
  }

  private loadVideoFile() {
    const file = this.voFormData.selectedFile();
    if (file) {
      this.videoUrl = URL.createObjectURL(file);
      setTimeout(() => {
        this.videoElement.nativeElement.src = this.videoUrl!;
      }, 0);
    }
  }

  private initPlotly() {
    const trace: Plotly.Data = {
      x: this.trajectory.x, 
      y: this.trajectory.y, 
      z: this.trajectory.z,
      mode: 'lines+markers',
      marker: { size: 3, color: 'blue' },
      line: { width: 2, color: 'blue' },
      type: 'scatter3d',
      name: 'UAV Trajectory'
    };

    const layout: Partial<Plotly.Layout> = {
      title: { text: 'Visual Odometry Path' },
      margin: { l: 0, r: 0, b: 0, t: 40 },
      scene: {
        xaxis: { title: { text: 'X (Right)' } },
        yaxis: { title: { text: 'Y (Down)' } },
        zaxis: { title: { text: 'Z (Forward)' } }
      }
    };

    const config: Partial<Plotly.Config> = { responsive: true };

    Plotly.newPlot(this.plotElement.nativeElement, [trace], layout, config);
  }

  startProcessing() {
    if (!this.voFormData.selectedFile()) return;
    
    this.isProcessing = true;
    this.videoElement.nativeElement.play();
    this.streamService.connect(this.voFormData.selectedConfigId());
  }

  stopProcessing() {
    this.isProcessing = false;
    this.videoElement.nativeElement.pause();
    this.streamService.disconnect();
  }

  private extractAndSendFrame() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Frame = canvas.toDataURL('image/jpeg', 0.6);
    this.streamService.sendFrame(base64Frame);
  }

  ngOnDestroy() {
    this.stopProcessing();
    this.subs.unsubscribe();
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }
  }
}