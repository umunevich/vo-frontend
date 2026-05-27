import { TestBed } from '@angular/core/testing';

import { VoStream } from './vo-stream';

describe('VoStream', () => {
  let service: VoStream;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoStream);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
