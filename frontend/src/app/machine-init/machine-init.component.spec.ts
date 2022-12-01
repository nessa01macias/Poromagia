import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineInitComponent } from './machine-init.component';
import {HttpClientModule} from "@angular/common/http";

describe('MachineInitComponent', () => {
  let component: MachineInitComponent;
  let fixture: ComponentFixture<MachineInitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
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
