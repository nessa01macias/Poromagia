import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsComponent } from './statistics.component';
import {HttpClientModule} from "@angular/common/http";
import {Observable} from "rxjs";

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ StatisticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dropdown on toggleDropdown if dropdown is closed', () => {
    expect(component.dropdownOpen).toBeFalse();
    component.toggleSelectDropdown();
    expect(component.dropdownOpen).toBeTrue();
  });

  it('should close dropdown without loading new chart if data is invalid', () => {
    // should close dropdown without displaying a graph, if there was no graph displayed previously
    component.dropdownOpen = true;
    component.toggleSelectDropdown();
    expect(component.dropdownOpen).toBeFalse();
    expect(component.displayPreviousGraph).toBeFalse();

    // should close dropdown and display previous graph, if there was a graph displayed previously
    component.dropdownOpen = true;
    component.yAxisValues = [[1, 2, 3, 4]];
    component.toggleSelectDropdown();
    expect(component.dropdownOpen).toBeFalse();
    expect(component.displayPreviousGraph).toBeTrue();
  });

  it('should set x values to dates if chart type is line', () => {
    component.dropdownOpen = true;
    component.chartType = 'line';
    component.fromDate = new Date('11-01-2022');
    component.toDate = new Date('11-06-2022');
    component.diagramTypes[0].selected = true;
    component.toggleSelectDropdown();
    expect(component.xAxisValues.length).toBe(6);
    expect(component.xAxisValues[0]).toBe('2022-11-01');
    expect(component.xAxisValues[1]).toBe('2022-11-02');
    expect(component.xAxisValues[2]).toBe('2022-11-03');
    expect(component.xAxisValues[3]).toBe('2022-11-04');
    expect(component.xAxisValues[4]).toBe('2022-11-05');
    expect(component.xAxisValues[5]).toBe('2022-11-06');
  });

  it('should call the http point to get the corresponding statistics data for the selected chart', () => {
    component.dropdownOpen = true;
    const fromDate = new Date('11-01-2022');
    const toDate = new Date('11-06-2022');
    component.fromDate = fromDate;
    component.toDate = toDate;
    const httpServiceSpy = spyOn(component.getHttpService(), 'callStatisticsEndpoint');
    httpServiceSpy.and.returnValue(new Observable());

    // 1 selected diagram types
    component.diagramTypes[0].selected = true;
    component.toggleSelectDropdown();
    expect(httpServiceSpy).toHaveBeenCalledOnceWith('ALL_CARDS', fromDate, toDate);
  });

  it('should call the http point to get the corresponding statistics data for each selected chart if multiple charts are selected', () => {
    component.dropdownOpen = true;
    component.fromDate = new Date('01-01-2022');
    component.toDate = new Date('02-02-2022');
    const httpServiceSpy = spyOn(component.getHttpService(), 'callStatisticsEndpoint');
    httpServiceSpy.and.returnValue(new Observable());

    // 2 selected diagram types -> should call http method twice
    component.diagramTypes[0].selected = true;
    component.diagramTypes[1].selected = true;
    component.toggleSelectDropdown();
    expect(httpServiceSpy).toHaveBeenCalledTimes(2);
  });

  function checkSelectedValues(selectedValues: boolean[]): void {
    for (let i = 0; i < selectedValues.length; i++) {
      expect(component.diagramTypes[i].selected).toBe(selectedValues[i]);
    }
  }

  it('should select the diagram type and deselect all other diagram types it is not combinable with', () => {
    // selecting multiple combinable diagram types should select multiple types
    checkSelectedValues([false, false, false, false, false, false, false]);
    component.selectDiagramType(2);
    checkSelectedValues([false, false, true, false, false, false, false]);
    component.selectDiagramType(3);
    checkSelectedValues([false, false, true, true, false, false, false]);
    component.selectDiagramType(0);
    checkSelectedValues([true, false, true, true, false, false, false]);

    // selecting diagram type that is not combinable with currently selected types should deselect all other types
    component.selectDiagramType(5);
    checkSelectedValues([false, false, false, false, false, true, false]);
  });

  it('should check if at least one diagram type is selected', () => {
    expect(component.typeIsSelected()).toBeFalse();
    component.selectDiagramType(5);
    expect(component.typeIsSelected()).toBeTrue();
    component.selectDiagramType(0);
    component.selectDiagramType(1);
    expect(component.typeIsSelected()).toBeTrue();
  });

  it('should check if the selected date values are valid', () => {
    // date values not set
    expect(component.fromDate).toBe(undefined);
    expect(component.toDate).toBe(undefined);
    expect(component.getDatesValidity()).toBeTrue();

    // one date value not set
    component.fromDate = new Date();
    expect(component.getDatesValidity()).toBeTrue();
    component.fromDate = undefined;
    component.toDate = new Date('11-11-2022');
    expect(component.getDatesValidity()).toBeTrue();

    // both date values set to valid values
    component.fromDate = new Date('01-01-2022');
    expect(component.getDatesValidity()).toBeTrue();

    // end date before start date
    component.fromDate = new Date('12-12-2022');
    expect(component.getDatesValidity()).toBeFalse();
  });
});
