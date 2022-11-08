import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineInitComponent } from './machine-init.component';

describe('MachineInitComponent', () => {
  let component: MachineInitComponent;
  let fixture: ComponentFixture<MachineInitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MachineInitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachineInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
