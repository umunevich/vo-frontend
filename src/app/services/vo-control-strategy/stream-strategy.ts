import { Inject, Injectable } from '@angular/core';
import { Switch, VoReady, VoStart } from './interface';
import { VoRouter } from '@entities/vo-router';
import { VoFormData } from '../vo-form-data';

@Injectable({
  providedIn: 'root',
})
export class StreamStrategy implements VoStart, VoReady, Switch {
  constructor(
    @Inject(VoRouter) private voRouter: VoRouter,
    private voData: VoFormData,
  ) {}

  launch(): void {
    this.voRouter.navigate('/monocular-visual-odometry/workspace/stream')
  }

  ready(): boolean {
    return this.voData.ready('stream');
  }

  switchOn(): void {
    this.voData.selectedFile.set(null);
  }
}
