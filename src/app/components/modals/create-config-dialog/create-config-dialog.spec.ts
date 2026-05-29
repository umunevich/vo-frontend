import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateConfigDialog } from './create-config-dialog';

describe('CreateConfigDialog', () => {
  let component: CreateConfigDialog;
  let fixture: ComponentFixture<CreateConfigDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateConfigDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateConfigDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
