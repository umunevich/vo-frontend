import { Injectable } from '@angular/core';
import { VoLaunchStrategy, VoReady } from './interface';
import { Router } from '@angular/router';
import { VoData } from '../vo-data';

@Injectable({
  providedIn: 'root',
})
export class FileLaunchStrategy implements VoLaunchStrategy, VoReady {
  constructor(
    private router: Router,
    private voData: VoData,
  ) {}
  
  launch() {
    console.log("📂 Starting File VO with file:", this.voData.selectedFile?.name);
    this.router.navigate(['/monocular-visual-odometry/workspace']);
  }

  ready(): boolean {
    return this.voData.isReady('file');
  }
}
