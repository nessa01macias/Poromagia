import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphComponent } from './graph.component';

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    component.chartType = 'line';
    component.graphTitle = 'TestTitle';
    component.xAxisTitle = 'xAxisTest';
    component.yAxisTitle = 'yAxisTest';
    component.xAxisValues = ['val1', 'val2', 'val3', 'val4'];
    component.yAxisValues = [[1, 2, 3, 4], [8, 2, 0, 4]];
    component.datasetLabels = ['dataset1', 'dataset2'];
    component.tension = [0, 0.5];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
