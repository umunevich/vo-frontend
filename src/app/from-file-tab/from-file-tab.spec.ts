import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FromFileTab } from './from-file-tab';

describe('FromFileTab', () => {
  let component: FromFileTab;
  let fixture: ComponentFixture<FromFileTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FromFileTab],
    }).compileComponents();

    fixture = TestBed.createComponent(FromFileTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
