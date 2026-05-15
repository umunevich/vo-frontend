import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseWorkspace } from './base';

describe('Base', () => {
  let component: BaseWorkspace;
  let fixture: ComponentFixture<BaseWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseWorkspace],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
