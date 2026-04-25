import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonocularVoPage } from './monocular-vo-page';

describe('MonocularVoPage', () => {
  let component: MonocularVoPage;
  let fixture: ComponentFixture<MonocularVoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonocularVoPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MonocularVoPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
