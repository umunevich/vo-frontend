import { Injectable } from '@angular/core';
import { VoLaunchStrategy } from './interface';
import { Router } from '@angular/router';
import { VoData } from '../vo-data';

@Injectable({
  providedIn: 'root',
})
export class FileLaunchStrategy implements VoLaunchStrategy {
  constructor(
    private router: Router,
    private voData: VoData,
  ) {}
  
  launch() {
    console.log("📂 Starting File VO with file:", this.voData.selectedFile?.name);
    this.router.navigate(['/monocular-visual-odometry/workspace']);
  }
}
