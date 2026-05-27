import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VoData } from '@services/vo-data';
import { VoStreamService } from '@services/vo-stream';

declare var Plotly: any;

@Component({
  selector: 'app-from-file-workspace',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './from-file.html',
  styleUrl: './from-file.css',
})
export class FromFileWorkspace {
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('frameCanvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  isProcessing: boolean = false;
  videoUrl: string | null = null;
  
  private processInterval: any;
  private ws!: WebSocket;

  constructor(private voData: VoData) {}

  ngOnInit() {
    this.initPlotly();
    this.loadVideoFile();
  }

  ngOnDestroy() {
    this.stopProcessing();
    // Звільняємо пам'ять браузера від створеного URL
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }
  }

  private loadVideoFile() {
    const file = this.voData.selectedFile();
    if (file) {
      // Створюємо локальне посилання на файл для тегу <video>
      this.videoUrl = URL.createObjectURL(file);
      // Angular потребує трохи часу на рендеринг ViewChild
      setTimeout(() => {
        this.videoElement.nativeElement.src = this.videoUrl!;
      }, 0);
    }
  }

  private initPlotly() {
    const trace = {
      x: [0], y: [0], z: [0],
      mode: 'lines+markers',
      marker: { size: 4, color: 'blue' },
      line: { width: 2, color: 'blue' },
      type: 'scatter3d',
      name: 'UAV Trajectory'
    };

    const layout = {
      title: 'Visual Odometry Path',
      margin: { l: 0, r: 0, b: 0, t: 40 },
      scene: {
        xaxis: { title: 'X (Right)' },
        yaxis: { title: 'Y (Down)' },
        zaxis: { title: 'Z (Forward)' }
      }
    };

    Plotly.newPlot('plotly-vo-chart', [trace], layout);
  }

  startProcessing() {
    if (!this.voData.selectedFile()) return;
    
    this.isProcessing = true;
    const video = this.videoElement.nativeElement;
    video.play();

    // Підключаємось до вашого FastAPI бекенду
    this.ws = new WebSocket('ws://localhost:8000/ws/vo-stream');

    this.ws.onopen = () => {
      console.log('WebSocket Connected. Starting frame extraction...');
      this.extractAndSendFrame(); // Відправляємо перший кадр
    };

    this.ws.onmessage = (event) => {
      const pose = JSON.parse(event.data);
      this.updatePlot(pose.x, pose.y, pose.z);
      
      // Ping-Pong: як тільки отримали координати — беремо і шлемо наступний кадр
      if (this.isProcessing && !video.paused && !video.ended) {
        // requestAnimationFrame робить виклик синхронним з оновленням екрану
        requestAnimationFrame(() => this.extractAndSendFrame());
      } else if (video.ended) {
        this.stopProcessing();
      }
    };

    this.ws.onerror = (error) => console.error('WebSocket Error:', error);
  }

  stopProcessing() {
    this.isProcessing = false;
    this.videoElement.nativeElement.pause();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  private extractAndSendFrame() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0) return;

    // Встановлюємо розмір полотна під розмір відео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Малюємо поточний кадр на полотні
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Конвертуємо у Base64 (якість 0.7 для швидкості)
    const base64Frame = canvas.toDataURL('image/jpeg', 0.7);
    
    // Відправляємо на FastAPI
    this.ws.send(base64Frame);
  }

  private updatePlot(x: number, y: number, z: number) {
    // Ефективно додаємо нову точку до графіка без повного перемалювання
    Plotly.extendTraces('plotly-vo-chart', { x: [[x]], y: [[y]], z: [[z]] }, [0]);
  }
}
