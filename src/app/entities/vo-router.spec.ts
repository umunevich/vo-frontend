import { TestBed } from '@angular/core/testing';

import { VoRouter } from './vo-router';

describe('Router', () => {
  let service: VoRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoRouter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
