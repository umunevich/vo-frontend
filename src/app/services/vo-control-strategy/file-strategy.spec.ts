import { TestBed } from '@angular/core/testing';

import { FileStrategy } from './file-strategy';

describe('FileLaunchStrategy', () => {
  let service: FileStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileStrategy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
