import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { VoFormData } from '@services/vo-form-data';
import { VoStreamService, TrajectoryCoords } from '@services/vo-stream';
import { TrajectoryService } from '@services/trajectory.service';
import {
  EuRoCSequenceInfo,
  TrajectoryEvaluateResponse,
  TrajectorySample,
} from '@entities/trajectory';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-from-file-workspace',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './from-file.html',
  styleUrl: './from-file.css',
})
export class FromFileWorkspace implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('frameCanvas', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('plotElement', { static: true }) plotElement!: ElementRef<HTMLDivElement>;

  isProcessing = false;
  isEvaluating = false;
  videoUrl: string | null = null;
  trajectory = { x: [0], y: [0], z: [0] };
  samples: TrajectorySample[] = [];
  eurocSequences: EuRoCSequenceInfo[] = [];
  selectedSequenceId: string | null = 'V1_01_easy';
  evalResult: TrajectoryEvaluateResponse | null = null;
  evalError: string | null = null;

  private subs = new Subscription();
  private frameIndex = 0;

  constructor(
    private voFormData: VoFormData,
    @Inject(VoStreamService) private streamService: VoStreamService,
    private trajectoryService: TrajectoryService,
  ) {}

  ngOnInit() {
    this.initPlotly();
    this.setupNetworkListeners();
    this.loadVideoFile();
    this.loadEuRoCSequences();
  }

  get hasTrajectory(): boolean {
    return this.samples.length >= 3;
  }

  get selectedSequenceAvailable(): boolean {
    const seq = this.eurocSequences.find((s) => s.id === this.selectedSequenceId);
    return !!seq?.available;
  }

  private loadEuRoCSequences() {
    this.subs.add(
      this.trajectoryService.listEuRoCSequences().subscribe({
        next: (sequences) => {
          this.eurocSequences = sequences;
          const preferred = sequences.find((s) => s.id === 'V1_01_easy' && s.available);
          if (preferred) {
            this.selectedSequenceId = preferred.id;
          } else {
            const firstAvailable = sequences.find((s) => s.available);
            this.selectedSequenceId = firstAvailable?.id ?? null;
          }
        },
        error: (err) => console.error('[FromFileWorkspace] Failed to load EuRoC sequences:', err),
      }),
    );
  }

  private setupNetworkListeners() {
    this.subs.add(
      this.streamService.coords$.subscribe((coords: TrajectoryCoords) => {
        this.trajectory.x.push(coords.x);
        this.trajectory.y.push(coords.y);
        this.trajectory.z.push(coords.z);

        this.samples.push({
          frame_index: this.frameIndex,
          x: coords.x,
          y: coords.y,
          z: coords.z,
          confidence: coords.confidence,
          tracking: coords.tracking,
        });
        this.frameIndex += 1;

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
        zaxis: { title: { text: 'Z (Forward)' } },
        aspectmode: 'data',
      },
      uirevision: 'file-trajectory',
    };

    const config: Partial<Plotly.Config> = { responsive: true };

    Plotly.newPlot(this.plotElement.nativeElement, [trace], layout, config);
  }

  private resetTrajectory() {
    this.trajectory = { x: [0], y: [0], z: [0] };
    this.samples = [];
    this.frameIndex = 0;
    this.evalResult = null;
    this.evalError = null;
    this.initPlotly();
  }

  startProcessing() {
    const configId = this.voFormData.selectedConfigId();
    if (!this.voFormData.selectedFile() || !configId) {
      console.error('[FromFileWorkspace] Missing video file or camera profile.');
      return;
    }

    this.resetTrajectory();
    this.isProcessing = true;
    this.streamService.connect(configId);
    this.videoElement.nativeElement.currentTime = 0;
    this.videoElement.nativeElement.play();
  }

  stopProcessing() {
    this.isProcessing = false;
    this.videoElement.nativeElement.pause();
    this.streamService.disconnect();
  }

  exportTumRaw() {
    if (!this.hasTrajectory) return;

    this.trajectoryService.exportTum({
      samples: this.samples,
      sequence_id: this.selectedSequenceId,
      fps: 20,
      apply_global_scale: false,
    }).subscribe({
      next: (response) => this.trajectoryService.downloadText(response.content, response.filename),
      error: (err) => {
        this.evalError = err?.error?.detail ?? 'Failed to export trajectory';
      },
    });
  }

  exportTumScaled() {
    if (!this.hasTrajectory || !this.selectedSequenceId) return;

    this.trajectoryService.exportTum({
      samples: this.samples,
      sequence_id: this.selectedSequenceId,
      apply_global_scale: true,
    }).subscribe({
      next: (response) => this.trajectoryService.downloadText(response.content, response.filename),
      error: (err) => {
        this.evalError = err?.error?.detail ?? 'Failed to export scaled trajectory';
      },
    });
  }

  evaluateScale() {
    if (!this.hasTrajectory || !this.selectedSequenceId) return;

    this.isEvaluating = true;
    this.evalError = null;

    this.trajectoryService.evaluateAgainstEuRoC(this.samples, this.selectedSequenceId).subscribe({
      next: (result) => {
        this.evalResult = result;
        this.isEvaluating = false;
      },
      error: (err) => {
        this.evalError = err?.error?.detail ?? 'Evaluation failed';
        this.evalResult = null;
        this.isEvaluating = false;
      },
    });
  }

  private extractAndSendFrame() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Frame = canvas.toDataURL('image/jpeg', 0.85);
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
