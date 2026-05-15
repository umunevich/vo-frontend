import { TestBed } from '@angular/core/testing';

import { StreamLaunchStrategy } from './stream-strategy';

describe('StreamLaunchStrategy', () => {
  let service: StreamLaunchStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamLaunchStrategy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
