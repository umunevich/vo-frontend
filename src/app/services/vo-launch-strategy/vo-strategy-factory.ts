import { Injectable } from '@angular/core';
import { StreamLaunchStrategy } from './stream-launch-strategy';
import { FileLaunchStrategy } from './file-launch-strategy';
import { VoLaunchStrategy } from './interface';

@Injectable({
  providedIn: 'root',
})
export class VoStrategyFactory {
  constructor(
    private streamStrategy: StreamLaunchStrategy,
    private fileStrategy: FileLaunchStrategy,
  ) {}
  
  getStrategy(url: string): VoLaunchStrategy {
    if (url.includes('stream')) {
      return this.streamStrategy;
    } else if (url.includes('from-file')) {
      return this.fileStrategy;
    }
    throw new Error('Unknown VO launch mode');
  }
}
