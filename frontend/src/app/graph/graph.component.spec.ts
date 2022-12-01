import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphComponent } from './graph.component';
import {DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;
  let de: DebugElement;

  function setInputValues(yAxisValues: number[][], datasetLabels: string[], tension: number[]) {
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    component.chartType = 'line';
    component.graphTitle = 'TestTitle';
    component.xAxisTitle = 'xAxisTest';
    component.yAxisTitle = 'yAxisTest';
    component.xAxisValues = ['val1', 'val2', 'val3', 'val4'];
    component.yAxisValues = yAxisValues;
    component.datasetLabels = datasetLabels;
    component.tension = tension;
    de = fixture.debugElement;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphComponent ]
    })
    .compileComponents();

    setInputValues([[1, 2, 3, 4], [8, 2, 0, 4]], ['dataset1', 'dataset2'], [0.5]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fill in tension values', () => {
    expect(component.tension.length).toBe(2);
    expect(component.tension[0]).toBe(0.5);
    expect(component.tension[1]).toBe(0.4);
  });

  it('should display warning messages if there are less dataset labels than datasets', () => {
    expect(component.getMessageService().getMessages().size).toBe(0);

    setInputValues([[1, 2, 3, 4], [8, 2, 0, 4]], ['dataset1'], []);

    expect(component.datasetLabels.length).toBe(1);
    expect(component.yAxisValues.length).toBe(2);
    expect(component.getMessageService().getMessages().size).toBe(1);
  });

  it('should make sure there are not more than 8 graphs', () => {
    // 10 datasets
    const yVals = [[1, 2, 3, 4], [8, 2, 0, 4], [8, 2, 0, 4], [8, 2, 0, 4], [8, 2, 0, 4], [8, 2, 0, 4], [8, 2, 0, 4], [8, 2, 0, 4], [8, 2, 0, 4], [8, 2, 0, 4]];
    setInputValues(yVals, ['dataset1'], []);
    expect(component.yAxisValues.length).toBe(8);
  });

  it('should create a chart element', () => {
    const canvasElement: HTMLCanvasElement = de.query(By.css('#canvas')).nativeElement;
    expect(canvasElement.width).toBeGreaterThan(0);
    expect(canvasElement.height).toBeGreaterThan(0);
  });

});
