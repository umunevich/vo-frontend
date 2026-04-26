import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoWorkspace } from './vo-workspace';

describe('VoWorkspace', () => {
  let component: VoWorkspace;
  let fixture: ComponentFixture<VoWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoWorkspace],
    }).compileComponents();

    fixture = TestBed.createComponent(VoWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
