import { Component, effect, input, signal, untracked } from '@angular/core';

export type VoTrackingState = 'initializing' | 'ok' | 'degraded' | 'lost' | null;

@Component({
  selector: 'app-vo-status-bar',
  standalone: true,
  templateUrl: './vo-status-bar.html',
  styleUrl: './vo-status-bar.css',
})
export class VoStatusBar {
  /** Latest values from the VO stream (may change every frame). */
  tracking = input<VoTrackingState>(null);
  confidence = input<number | null>(null);
  compact = input(false);
  /** Refresh the visible status once every N incoming frames. */
  updateEvery = input(10);

  displayTracking = signal<VoTrackingState>(null);
  displayConfidence = signal<number | null>(null);

  private pendingFrames = 0;
  private confidenceSum = 0;
  private confidenceCount = 0;

  constructor() {
    effect(() => {
      const tracking = this.tracking();
      const confidence = this.confidence();
      const interval = Math.max(1, this.updateEvery());

      if (tracking == null && confidence == null) {
        untracked(() => this.resetDisplay());
        return;
      }

      if (typeof confidence === 'number' && Number.isFinite(confidence)) {
        this.confidenceSum += confidence;
        this.confidenceCount += 1;
      }

      this.pendingFrames += 1;
      const isFirstSample = this.displayTracking() == null && tracking != null;
      const shouldFlush = this.pendingFrames >= interval || isFirstSample;

      if (!shouldFlush) {
        return;
      }

      const avgConfidence =
        this.confidenceCount > 0 ? this.confidenceSum / this.confidenceCount : confidence;

      untracked(() => {
        this.displayTracking.set(tracking);
        this.displayConfidence.set(
          typeof avgConfidence === 'number' && Number.isFinite(avgConfidence)
            ? avgConfidence
            : null,
        );
      });

      this.pendingFrames = 0;
      this.confidenceSum = 0;
      this.confidenceCount = 0;
    });
  }

  trackingLabel(): string {
    switch (this.displayTracking()) {
      case 'initializing':
        return 'Initializing';
      case 'ok':
        return 'OK';
      case 'degraded':
        return 'Degraded';
      case 'lost':
        return 'Lost';
      default:
        return '—';
    }
  }

  confidenceText(): string {
    const value = this.displayConfidence();
    if (value == null || Number.isNaN(value)) {
      return '—';
    }
    return value.toFixed(3);
  }

  private resetDisplay(): void {
    this.pendingFrames = 0;
    this.confidenceSum = 0;
    this.confidenceCount = 0;
    this.displayTracking.set(null);
    this.displayConfidence.set(null);
  }
}
