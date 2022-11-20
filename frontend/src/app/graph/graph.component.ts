import {Component, Input, OnInit} from '@angular/core';
import {Chart, registerables} from 'chart.js';


/**
 * xAxisValues, yAxisValues and datasetLabels are required attributes
 */
@Component({
  selector: 'app-graph[xAxisValues][yAxisValues][datasetLabels]',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  @Input() graphTitle!: string;
  @Input() xAxisTitle!: string;
  @Input() yAxisTitle!: string;
  @Input() xAxisValues!: string[];
  @Input() yAxisValues!: number[][];
  @Input() datasetLabels!: string[];
  @Input() tension: number[] = [];

  private defaultTension: number = 0.4;
  private maxGraphNumber: number = 5;
  private graphColors: string[] = ['#3151b9', '#9C31B9FF', '#29771CFF', '#CE7E21FF', '#CE212FFF'];

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (this.tension.length <= 0) {
      for (let i: number = 0; i < this.datasetLabels.length; i++) {
        this.tension.push(this.defaultTension);
      }
    }
    this.getChart();
    //TODO: check array length (dataset labels & yAxisValues arrays)
  }


  private getChart(): Chart {
    const datasetValues: any = [];
    this.yAxisValues.forEach((yDataset: number[], index: number) => datasetValues.push({
      label: this.datasetLabels[index],
      data: yDataset,
      backgroundColor: this.graphColors[index],
      borderColor: this.graphColors[index],
      tension: this.tension[index]
    }));

    return new Chart('canvas', {
      type: 'line',
      options: {
        animation: false,
        scales: {
          x: {
            title: {
              display: true,
              text: this.xAxisTitle ? this.xAxisTitle : '',
              color: '#000000'
            }
          },
          y: {
            title: {
              display: true,
              text: this.yAxisTitle ? this.yAxisTitle : '',
              color: "#000000"
            },
            ticks: {
              color:  "#000000"
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: this.graphTitle ? this.graphTitle : ''
          },
          legend: {
            labels: {
              color: "#000000"
            }
          }
        }
      },
      data: {
        labels: this.xAxisValues,
        datasets: datasetValues
      }
    });
  }

}
