import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamTab } from './stream-tab';

describe('StreamTab', () => {
  let component: StreamTab;
  let fixture: ComponentFixture<StreamTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamTab],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
