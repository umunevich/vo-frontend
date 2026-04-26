import { Injectable } from '@angular/core';
import { VoLaunchStrategy } from './interface';
import { Router } from '@angular/router';
import { VoData } from '../vo-data';

@Injectable({
  providedIn: 'root',
})
export class StreamLaunchStrategy implements VoLaunchStrategy {
  constructor(
    private router: Router,
    private voData: VoData,
  ) {}

  launch() {
    console.log("🚀 Starting Stream VO with device:", this.voData.selectedDevice);
    this.router.navigate(['/monocular-visual-odometry/workspace'])
  }
}
