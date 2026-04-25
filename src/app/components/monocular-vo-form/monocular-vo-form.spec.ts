import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonocularVoForm } from './monocular-vo-form';

describe('MonocularVoForm', () => {
  let component: MonocularVoForm;
  let fixture: ComponentFixture<MonocularVoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonocularVoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(MonocularVoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
