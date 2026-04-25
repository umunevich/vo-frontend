import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonocularVoAbout } from './monocular-vo-about';

describe('MonocularVoAbout', () => {
  let component: MonocularVoAbout;
  let fixture: ComponentFixture<MonocularVoAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonocularVoAbout],
    }).compileComponents();

    fixture = TestBed.createComponent(MonocularVoAbout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
