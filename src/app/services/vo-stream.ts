import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '@environments/environment';
import { Subject } from 'rxjs';

export interface TrajectoryCoords {
  x: number;
  y: number;
  z: number;
  confidence?: number;
  tracking?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VoStreamService implements OnDestroy {
  private ws: WebSocket | null = null;
  private activeConfigId: string | null = null;
  private pendingFrame: string | null = null;
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly responseTimeoutMs = 2500;

  private coordsSubject = new Subject<TrajectoryCoords>();
  coords$ = this.coordsSubject.asObservable();

  private readyForNextFrameSubject = new Subject<void>();
  readyForNextFrame$ = this.readyForNextFrameSubject.asObservable();

  private connectedSubject = new Subject<void>();
  connected$ = this.connectedSubject.asObservable();

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  connect(configId: string | null | undefined): void {
    if (!configId) {
      console.error('[VoStreamService] Missing camera profile id; cannot start VO stream.');
      return;
    }

    const wsUrl = `${environment.voBackendWsUrl}/vo-stream?config_id=${encodeURIComponent(configId)}`;

    if (
      this.ws &&
      this.activeConfigId === configId &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.disconnect();
    this.activeConfigId = configId;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`Connected to VO backend with profile "${configId}"`);
      this.connectedSubject.next();
      this.flushPendingFrame();
      this.armWatchdog();
      this.readyForNextFrameSubject.next();
    };

    this.ws.onmessage = (event) => {
      this.onMessage(event);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.activeConfigId = null;
      this.clearWatchdog();
    };
    this.ws.onerror = (error) => console.error('WebSocket error:', error);
  }

  sendFrame(frameData: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(frameData);
      this.armWatchdog();
      return;
    }

    this.pendingFrame = frameData;
  }

  disconnect(): void {
    this.clearWatchdog();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.activeConfigId = null;
    this.pendingFrame = null;
  }

  private flushPendingFrame(): void {
    if (this.pendingFrame && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(this.pendingFrame);
      this.pendingFrame = null;
      this.armWatchdog();
    }
  }

  private armWatchdog(): void {
    this.clearWatchdog();
    this.watchdogTimer = setTimeout(() => {
      if (this.isConnected) {
        console.warn('[VoStreamService] Backend response timeout — retrying frame pipeline');
        this.readyForNextFrameSubject.next();
      }
    }, this.responseTimeoutMs);
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer !== null) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private onMessage(event: MessageEvent): void {
    try {
      const coords: TrajectoryCoords = JSON.parse(event.data);
      this.coordsSubject.next(coords);
      this.armWatchdog();
      this.readyForNextFrameSubject.next();
    } catch (error) {
      console.error('[VoStreamService] Failed to parse VO response:', error, event.data);
      this.readyForNextFrameSubject.next();
    }
  }
}
