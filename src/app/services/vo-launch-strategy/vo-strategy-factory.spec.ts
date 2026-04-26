import { TestBed } from '@angular/core/testing';

import { VoStrategyFactory } from './vo-strategy-factory';

describe('VoStrategyFactory', () => {
  let service: VoStrategyFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoStrategyFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
