import { TestBed } from '@angular/core/testing';

import { VoData } from './vo-data';

describe('VoData', () => {
  let service: VoData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
