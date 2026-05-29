import { TestBed } from '@angular/core/testing';

import { VoStreamService } from './vo-stream';

describe('VoStream', () => {
  let service: VoStreamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoStreamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
