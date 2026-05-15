import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FromFile } from './from-file';

describe('FromFile', () => {
  let component: FromFile;
  let fixture: ComponentFixture<FromFile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FromFile],
    }).compileComponents();

    fixture = TestBed.createComponent(FromFile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
