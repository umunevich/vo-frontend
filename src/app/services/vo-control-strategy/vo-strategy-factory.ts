import { Injectable } from '@angular/core';
import { StreamStrategy } from './stream-strategy';
import { FileStrategy } from './file-strategy';
import { VoStart, VoReady, Switch } from './interface';

@Injectable({
  providedIn: 'root',
})
export class VoStrategyFactory {
  constructor(
    private streamStrategy: StreamStrategy,
    private fileStrategy: FileStrategy,
  ) {}
  
  startStrategy(url: string): VoStart {
    return this.strategy(url);
  }

  readyStrategy(url: string): VoReady {
    return this.strategy(url);
  }

  switchStrategy(url: string): Switch {
    return this.strategy(url);
  }

  private strategy(url: string): StreamStrategy | FileStrategy {
    if (url.includes('stream')) {
      return this.streamStrategy;
    } else if (url.includes('from-file')) {
      return this.fileStrategy;
    }
    throw new Error('Unknown VO mode');
  }
}
