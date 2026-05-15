import { Injectable } from '@angular/core';
import { StreamLaunchStrategy } from './stream-strategy';
import { FileLaunchStrategy } from './file-strategy';
import { VoLaunchStrategy, VoReady } from './interface';

@Injectable({
  providedIn: 'root',
})
export class VoStrategyFactory {
  constructor(
    private streamStrategy: StreamLaunchStrategy,
    private fileStrategy: FileLaunchStrategy,
  ) {}
  
  launchStrategy(url: string): VoLaunchStrategy {
    if (url.includes('stream')) {
      return this.streamStrategy;
    } else if (url.includes('from-file')) {
      return this.fileStrategy;
    }
    throw new Error('Unknown VO mode');
  }

  readyStrategy(url: string): VoReady {
    if (url.includes('stream')) {
      return this.streamStrategy;
    } else if (url.includes('from-file')) {
      return this.fileStrategy;
    }
    throw new Error('Unknown VO mode');
  }
}
