import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualComponent } from './manual.component';

describe('ManualComponent', () => {
  let component: ManualComponent;
  let fixture: ComponentFixture<ManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change the dropdown status on the given index', () => {
    expect(component.dropdownOpenValues[0]).toBeFalse();
    expect(component.dropdownOpenValues[1]).toBeFalse();
    expect(component.dropdownOpenValues[2]).toBeFalse();

    component.toggleDropdownStatus(1);
    expect(component.dropdownOpenValues[0]).toBeFalse();
    expect(component.dropdownOpenValues[1]).toBeTrue();
    expect(component.dropdownOpenValues[2]).toBeFalse();

    component.toggleDropdownStatus(2);
    expect(component.dropdownOpenValues[0]).toBeFalse();
    expect(component.dropdownOpenValues[1]).toBeTrue();
    expect(component.dropdownOpenValues[2]).toBeTrue();

    component.toggleDropdownStatus(2);
    expect(component.dropdownOpenValues[0]).toBeFalse();
    expect(component.dropdownOpenValues[1]).toBeTrue();
    expect(component.dropdownOpenValues[2]).toBeFalse();
  });
});
