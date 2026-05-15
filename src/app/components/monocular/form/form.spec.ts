import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonocularForm } from './form';

describe('MonocularForm', () => {
  let component: MonocularForm;
  let fixture: ComponentFixture<MonocularForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonocularForm],
    }).compileComponents();

    fixture = TestBed.createComponent(MonocularForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
