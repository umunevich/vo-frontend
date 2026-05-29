import { TestBed } from '@angular/core/testing';

import { VoFormData } from './vo-form-data';

describe('VoFormData', () => {
  let service: VoFormData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoFormData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
