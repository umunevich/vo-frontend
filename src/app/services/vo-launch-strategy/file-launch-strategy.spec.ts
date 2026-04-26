import { TestBed } from '@angular/core/testing';

import { FileLaunchStrategy } from './file-launch-strategy';

describe('FileLaunchStrategy', () => {
  let service: FileLaunchStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileLaunchStrategy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
