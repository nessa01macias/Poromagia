import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineInitComponent } from './machine-init.component';
import {HttpClientModule} from "@angular/common/http";

describe('MachineInitComponent', () => {
  let component: MachineInitComponent;
  let fixture: ComponentFixture<MachineInitComponent>;

  function initializeComponent(): void {
    fixture = TestBed.createComponent(MachineInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function resetValues(): void {
    component.lowerBoundary = '';
    component.upperBoundary = '';
    component.machineStopped = true;
    component.selectedCatIndex = 0;
    component.keyboardDisplayed = false;
    component.editingLowerBoundary = false;
    component.editingUpperBoundary = false;
    component.sortingCategories[0].selected = true;
    component.sortingCategories[1].selected = false;
    component.sortingCategories[2].selected = false;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ MachineInitComponent ]
    })
    .compileComponents();

    initializeComponent();
    resetValues();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read the machine status from the local storage', () => {
    expect(component.machineStopped).toBeTrue();

    // test reading values from local storage when status is 'running'
    localStorage.setItem('MACHINE_STATUS', JSON.stringify({'status': 'running', 'category': 0, 'lower': 0.5, 'upper': 1}));
    initializeComponent();
    expect(component.machineStopped).toBeFalse();
    expect(component.lowerBoundary.toString()).toBe('0.5');
    expect(component.upperBoundary.toString()).toBe('1');
    expect(component.selectedCatIndex).toBe(0);
    expect(component.sortingCategories[0].selected).toBeTrue();
    expect(component.sortingCategories[1].selected).toBeFalse();
    expect(component.sortingCategories[2].selected).toBeFalse();

    // test reading values from local storage when status is 'stopped'
    localStorage.setItem('MACHINE_STATUS', JSON.stringify({'status': 'stopped'}));
    initializeComponent();
    expect(component.machineStopped).toBeTrue();
  });

  it('should add a click event listener to the whole page when mounting', () => {
    // set values to test if click event resets them
    component.keyboardDisplayed = true;
    component.editingUpperBoundary = true;
    expect(component.keyboardDisplayed).toBeTrue();
    expect(component.editingLowerBoundary).toBeFalse();
    expect(component.editingUpperBoundary).toBeTrue();

    // click on random element on the page to check if it hides keyboard
    let categoryButtons = fixture.debugElement.nativeElement.querySelector('.categoryButtons');
    categoryButtons.click();
    expect(component.keyboardDisplayed).toBeFalse();
    expect(component.editingLowerBoundary).toBeFalse();
    expect(component.editingUpperBoundary).toBeFalse();
  });

  it('should not hide the keyboard when clicking on an element with class "keyboardDisplay"', () => {
    // set values to test if they stay the same after clicking on element with class 'keyboardDisplay'
    component.keyboardDisplayed = true;
    component.editingUpperBoundary = true;
    expect(component.keyboardDisplayed).toBeTrue();
    expect(component.editingLowerBoundary).toBeFalse();
    expect(component.editingUpperBoundary).toBeTrue();

    // click on element with class 'keyboardDisplay' to check if the keyboard is still displayed
    let upperBoundaryInput = fixture.debugElement.nativeElement.querySelector('#upperBoundary');
    upperBoundaryInput.click();
    expect(component.keyboardDisplayed).toBeTrue();
    expect(component.editingLowerBoundary).toBeFalse();
    expect(component.editingUpperBoundary).toBeTrue();
  });

  it('should update selected values of all categories when selecting a category', () => {
    // check default values first
    expect(component.sortingCategories[0].selected).toBeTrue();
    expect(component.sortingCategories[1].selected).toBeFalse();
    expect(component.sortingCategories[2].selected).toBeFalse();
    expect(component.selectedCatIndex).toBe(0);

    // select category 'Wanted' and check values again
    component.selectCategory('Wanted');
    expect(component.sortingCategories[0].selected).toBeFalse();
    expect(component.sortingCategories[1].selected).toBeFalse();
    expect(component.sortingCategories[2].selected).toBeTrue();
    expect(component.selectedCatIndex).toBe(2);
  });

  it('should check if the currently selected category is configurable', () => {
    expect(component.selectedCatIndex).toBe(0);
    expect(component.getConfigurable()).toBeTrue();
    component.selectCategory('Wanted');
    expect(component.getConfigurable()).toBeFalse();
  });

  it('should save the machine status in the local storage when starting the machine', () => {
    component.lowerBoundary = '0.5';
    component.upperBoundary = '10';
    component.selectedCatIndex = 1;
    component.startSorting();
    const savedMachineStatus = localStorage.getItem('MACHINE_STATUS');
    const machineStatusParsed = savedMachineStatus ? JSON.parse(savedMachineStatus) : {};
    expect(machineStatusParsed['status']).toBe('running');
    expect(machineStatusParsed['lower']).toBe('0.5');
    expect(machineStatusParsed['upper']).toBe('10');
    expect(machineStatusParsed['category']).toBe(1);
  });

  it('should display a success message when starting the machine', () => {
    expect(component.getMessageService().getMessages().size).toBe(0);
    component.startSorting();
    expect(component.getMessageService().getMessages().size).toBe(1);
  });

  it('should send an http start request and start the machine when starting the machine', () => {
    component.lowerBoundary = '0';
    component.upperBoundary = '5.5';
    const mySpy = spyOn(component.getHttpService(), 'startSorting');
    component.startSorting();
    expect(mySpy).toHaveBeenCalledOnceWith('Price', 0, 5.5);
    expect(component.machineStopped).toBeFalse();
  });

  it('should only use input boundary values for starting the machine if values are valid', () => {
    // set boundary values to invalid values
    component.lowerBoundary = '0xyz.9?++.4';
    component.upperBoundary = '-10.3.4';
    const mySpy = spyOn(component.getHttpService(), 'startSorting');
    component.startSorting();
    expect(mySpy).toHaveBeenCalledOnceWith('Price', 0, 0);
  });

  it('should save the machine status in the local storage when stopping the machine', () => {
    component.pauseSorting();
    const savedMachineStatus = localStorage.getItem('MACHINE_STATUS');
    const machineStatusParsed = savedMachineStatus ? JSON.parse(savedMachineStatus) : {};
    expect(machineStatusParsed['status']).toBe('stopped');
  });

  it('should display a success message when stopping the machine', () => {
    expect(component.getMessageService().getMessages().size).toBe(0);
    component.pauseSorting();
    expect(component.getMessageService().getMessages().size).toBe(1);
  });

  it('should send an http stop request and stop the machine when stopping the machine', () => {
    const mySpy = spyOn(component.getHttpService(), 'pauseSorting');
    component.pauseSorting();
    expect(mySpy).toHaveBeenCalledTimes(1);
    expect(component.machineStopped).toBeTrue();
  });

  it('should display the touch keyboard when editing a boundary value', () => {
    // check if keyboard is not displayed first
    expect(component.keyboardDisplayed).toBeFalse();

    // click lower boundary input field
    let lowerInput = fixture.debugElement.nativeElement.querySelector('#lowerBoundary');
    lowerInput.click();
    expect(component.keyboardDisplayed).toBeTrue();
    expect(component.editingLowerBoundary).toBeTrue();
    expect(component.editingUpperBoundary).toBeFalse();

    // reset values
    resetValues();
    expect(component.keyboardDisplayed).toBeFalse();

    // click upper boundary input field
    let upperInput = fixture.debugElement.nativeElement.querySelector('#upperBoundary');
    upperInput.click();
    expect(component.keyboardDisplayed).toBeTrue();
    expect(component.editingLowerBoundary).toBeFalse();
    expect(component.editingUpperBoundary).toBeTrue();
  });

  it('should display warning message and not edit value when entering too long value with touch keyboard', () => {
    // set lower boundary to value of length 12
    component.lowerBoundary = '1234567890.1';
    component.editingLowerBoundary = true;
    // extend lower boundary value to length 13 (maximum allowed length)
    component.enterKeyboardValue('2');
    expect(component.lowerBoundary).toBe('21234567890.1');
    // add 14th character (not allowed) and check if value remains the same
    component.enterKeyboardValue('3');
    expect(component.lowerBoundary).toBe('21234567890.1');
  });

  it('should edit the boundary value according to the pressed button on the touch keyboard', () => {
    component.editingUpperBoundary = true;
    expect(component.upperBoundary).toBe('');

    component.enterKeyboardValue('2');
    expect(component.upperBoundary).toBe('2');
    component.enterKeyboardValue('.');
    expect(component.upperBoundary).toBe('2.');
    component.enterKeyboardValue('4');
    expect(component.upperBoundary).toBe('2.4');
    component.enterKeyboardValue('Delete');
    expect(component.upperBoundary).toBe('2.');
    component.enterKeyboardValue('0');
    expect(component.upperBoundary).toBe('2.0');
  });

  it('should should stop editing and hide the keyboard when pressing "Ok" on the touch keyboard', () => {
    component.editingLowerBoundary = true;
    expect(component.lowerBoundary).toBe('');
    component.enterKeyboardValue('2');
    expect(component.lowerBoundary).toBe('2');
    component.enterKeyboardValue('Ok');
    expect(component.lowerBoundary).toBe('2');

    expect(component.editingLowerBoundary).toBeFalse();
    expect(component.keyboardDisplayed).toBeFalse();
  });

  it('should handle clicking delete button on touch keyboard if there is not input value', () => {
    component.editingUpperBoundary = true;
    expect(component.upperBoundary).toBe('');

    // deleting empty value should not change value
    component.enterKeyboardValue('Delete');
    expect(component.upperBoundary).toBe('');
  });

  it('should only allow one "." per input value when entering values per touch keyboard', () => {
    component.editingUpperBoundary = true;
    component.upperBoundary = '8.12';

    // entering second '.' should not change the value
    component.enterKeyboardValue('.');
    expect(component.upperBoundary).toBe('8.12');
  });

  it('should not change valid boundary value when entering it as input value', () => {
    component.lowerBoundary = '1234.56';
    expect(component.lowerBoundary).toBe('1234.56');
    // valid value should not be changed
    component.handleLowerBoundaryInput();
    expect(component.lowerBoundary).toBe('1234.56');
  });

  it('should remove invalid characters from boundary value when entering it as input value', () => {
    component.lowerBoundary = '1234.56ddfjdödsj';
    expect(component.lowerBoundary).toBe('1234.56ddfjdödsj');
    // valid value should not be changed
    component.handleLowerBoundaryInput();
    expect(component.lowerBoundary).toBe('1234.56');
  });

  it('should cut boundary value to maximum allowed length when entering it as input value', () => {
    // too long value (18 characters instead of 13)
    component.upperBoundary = '123456789012345678';
    expect(component.upperBoundary).toBe('123456789012345678');
    // valid value should not be changed
    component.handleUpperBoundaryInput();
    expect(component.upperBoundary).toBe('1234567890123');
  });

  it('should get the css classes of a given input field', () => {
    // input field contains valid value and is not being edited right now
    expect(component.getInputCssClasses(true)).toBe('keyboardDisplay');

    // input field contains invalid value and is not being edited right now
    component.lowerBoundary = '5.1';
    component.upperBoundary = '5';
    expect(component.getInputCssClasses(false)).toBe('keyboardDisplay invalid');

    // input field contains invalid value and is being edited right now
    component.editingLowerBoundary = true;
    expect(component.getInputCssClasses(true)).toBe('keyboardDisplay editMode invalid');

    // input field contains valid value and is being edited right now
    component.upperBoundary = '10';
    expect(component.getInputCssClasses(true)).toBe('keyboardDisplay editMode');
    // make sure css classes for other input field don't contain 'editMode' class
    expect(component.getInputCssClasses(false)).toBe('keyboardDisplay');
  });

});
