import { Inject, Injectable } from '@angular/core';
import { VoStart, VoReady, Switch } from './interface';
import { VoFormData } from '../vo-form-data';
import { VoRouter } from '@entities/vo-router';

@Injectable({
  providedIn: 'root',
})
export class FileStrategy implements VoStart, VoReady, Switch {
  constructor(
    @Inject(VoRouter) private voRouter: VoRouter,
    private voData: VoFormData,
  ) {}
  
  launch(): void {
    this.voRouter.navigate('/monocular-visual-odometry/workspace/from-file');
  }

  ready(): boolean {
    return this.voData.ready('file');
  }

  switchOn(): void {
    this.voData.selectedDevice.set(null);
  }
}
