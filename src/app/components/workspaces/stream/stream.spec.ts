import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamWorkspace } from './stream';

describe('Stream', () => {
  let component: StreamWorkspace;
  let fixture: ComponentFixture<StreamWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamWorkspace],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
