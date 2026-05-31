import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { VoStatusBar, VoTrackingState } from '@components/shared/vo-status-bar/vo-status-bar';
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
  imports: [DecimalPipe, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, VoStatusBar],
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
  trackingState = signal<VoTrackingState>(null);
  confidence = signal<number | null>(null);

  private subs = new Subscription();
  /** Index of the next video frame to send to VO (0-based). */
  private voFrameIndex = 0;
  /** True while waiting for backend response for the current frame. */
  private awaitingVoResponse = false;
  private voWatchdog: ReturnType<typeof setTimeout> | null = null;
  private readonly videoFps = 20;
  private readonly voResponseTimeoutMs = 2500;

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
      this.streamService.connected$.subscribe(() => {
        if (this.isProcessing) {
          this.sendCurrentVoFrame();
        }
      }),
    );

    this.subs.add(
      this.streamService.coords$.subscribe((coords: TrajectoryCoords) => {
        this.trackingState.set((coords.tracking as VoTrackingState) ?? null);
        this.confidence.set(
          typeof coords.confidence === 'number' && Number.isFinite(coords.confidence)
            ? coords.confidence
            : null,
        );

        this.trajectory.x.push(coords.x);
        this.trajectory.y.push(coords.y);
        this.trajectory.z.push(coords.z);

        const frameIndex = this.voFrameIndex;
        this.samples.push({
          frame_index: frameIndex,
          x: coords.x,
          y: coords.y,
          z: coords.z,
          confidence: coords.confidence,
          tracking: coords.tracking,
        });
        this.voFrameIndex += 1;
        this.awaitingVoResponse = false;
        this.clearVoWatchdog();

        Plotly.extendTraces(this.plotElement.nativeElement, {
          x: [[coords.x]], y: [[coords.y]], z: [[coords.z]]
        }, [0]);

        if (this.isProcessing && this.voFrameIndex < this.maxVoFrames()) {
          this.sendCurrentVoFrame();
        } else {
          this.stopProcessing();
        }
      }),
    );
  }

  private maxVoFrames(): number {
    const seq = this.eurocSequences.find((s) => s.id === this.selectedSequenceId);
    if (seq?.frame_count && seq.frame_count > 0) {
      return seq.frame_count;
    }
    const video = this.videoElement.nativeElement;
    if (video.duration && Number.isFinite(video.duration)) {
      return Math.ceil(video.duration * this.videoFps);
    }
    return Number.POSITIVE_INFINITY;
  }

  private sendCurrentVoFrame(isRetry = false) {
    if (!this.isProcessing || this.voFrameIndex >= this.maxVoFrames()) {
      if (this.isProcessing) {
        this.stopProcessing();
      }
      return;
    }

    const video = this.videoElement.nativeElement;
    if (video.videoWidth === 0) {
      return;
    }

    video.pause();
    video.currentTime = this.voFrameIndex / this.videoFps;
    this.awaitingVoResponse = true;
    this.armVoWatchdog();

    const captureFrame = () => {
      if (!this.isProcessing) {
        return;
      }
      const canvas = this.canvasElement.nativeElement;
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Frame = canvas.toDataURL('image/jpeg', 0.85);
      this.streamService.sendFrame(base64Frame);

      if (isRetry) {
        console.warn(`[FromFileWorkspace] Retrying VO frame ${this.voFrameIndex}`);
      }
    };

    if (Math.abs(video.currentTime - this.voFrameIndex / this.videoFps) < 1e-4) {
      requestAnimationFrame(captureFrame);
      return;
    }

    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      requestAnimationFrame(captureFrame);
    };
    video.addEventListener('seeked', onSeeked);
  }

  private armVoWatchdog() {
    this.clearVoWatchdog();
    this.voWatchdog = setTimeout(() => {
      if (this.isProcessing && this.awaitingVoResponse) {
        this.sendCurrentVoFrame(true);
      }
    }, this.voResponseTimeoutMs);
  }

  private clearVoWatchdog() {
    if (this.voWatchdog !== null) {
      clearTimeout(this.voWatchdog);
      this.voWatchdog = null;
    }
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
    this.voFrameIndex = 0;
    this.awaitingVoResponse = false;
    this.evalResult = null;
    this.evalError = null;
    this.trackingState.set(null);
    this.confidence.set(null);
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
    const video = this.videoElement.nativeElement;
    video.currentTime = 0;
    video.pause();
  }

  stopProcessing() {
    this.isProcessing = false;
    this.awaitingVoResponse = false;
    this.clearVoWatchdog();
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
        this.renderEvaluationPlot(result);
      },
      error: (err) => {
        this.evalError = this.formatApiError(err, 'Evaluation failed');
        this.evalResult = null;
        this.isEvaluating = false;
      },
    });
  }

  /** Replace raw VO plot with Sim(3)-aligned metric trajectory vs EuRoC GT. */
  private renderEvaluationPlot(result: TrajectoryEvaluateResponse) {
    const gtTrace: Plotly.Data = {
      x: result.ground_truth_positions.map((p) => p[0]),
      y: result.ground_truth_positions.map((p) => p[1]),
      z: result.ground_truth_positions.map((p) => p[2]),
      mode: 'lines',
      line: { width: 3, color: 'green' },
      type: 'scatter3d',
      name: 'Ground truth',
    };

    const voTrace: Plotly.Data = {
      x: result.scaled_positions.map((p) => p[0]),
      y: result.scaled_positions.map((p) => p[1]),
      z: result.scaled_positions.map((p) => p[2]),
      mode: 'lines+markers',
      marker: { size: 3, color: 'blue' },
      line: { width: 2, color: 'blue' },
      type: 'scatter3d',
      name: 'VO (Sim3-scaled)',
    };

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: [
          `Sim(3) vs ${result.sequence_label}`,
          `s = ${result.global_scale.toFixed(4)} | ATE RMSE = ${result.ate_rmse_m.toFixed(3)} m | GT = ${result.gt_path_length_m.toFixed(1)} m | VO (scaled) = ${result.est_path_length_scaled_m.toFixed(1)} m`,
        ].join('<br>'),
      },
      margin: { l: 0, r: 0, b: 0, t: 72 },
      scene: {
        xaxis: { title: { text: 'X [m]' } },
        yaxis: { title: { text: 'Y [m]' } },
        zaxis: { title: { text: 'Z [m]' } },
        aspectmode: 'data',
      },
      uirevision: 'eval-plot',
    };

    const config: Partial<Plotly.Config> = { responsive: true };

    Plotly.newPlot(this.plotElement.nativeElement, [gtTrace, voTrace], layout, config);
  }

  private formatApiError(err: unknown, fallback: string): string {
    const detail = (err as { error?: { detail?: unknown } })?.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item) => (typeof item?.msg === 'string' ? item.msg : JSON.stringify(item)))
        .join('; ');
    }
    return fallback;
  }

  ngOnDestroy() {
    this.stopProcessing();
    this.clearVoWatchdog();
    this.subs.unsubscribe();
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }
  }
}
