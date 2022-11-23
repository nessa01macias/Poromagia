import {Component, Input, OnInit} from '@angular/core';
import {Chart, registerables} from 'chart.js';
import {MessageService} from "../_services/message.service";


export type chartType = 'line' | 'doughnut' | 'table';

/**
 * xAxisValues, yAxisValues and datasetLabels are required attributes
 */
@Component({
  selector: 'app-graph[xAxisValues][yAxisValues][datasetLabels]',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  @Input() chartType: chartType = 'line';
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

  constructor(private messageService: MessageService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // fill tension array with default values if it contains less values than datasets
    if (this.tension.length < this.yAxisValues.length) {
      for (let i: number = this.tension.length; i <= this.datasetLabels.length; i++) {
        this.tension.push(this.defaultTension);
      }
    }

    // check validity of input variables
    if (this.yAxisValues.length > this.datasetLabels.length) {
      this.messageService.add("Failed to get graph label", 'WARNING', 3000);
    }
    if (this.yAxisValues.length > this.maxGraphNumber) {
      this.messageService.add("Too many graphs selected - Only the first " + this.maxGraphNumber + " graphs are displayed",
        'WARNING', 4000);
      this.yAxisValues = this.yAxisValues.slice(0, 5);
    }

    this.getChart();
  }

  private getChart(): Chart {
    const datasetValues: any = [];
    this.yAxisValues.forEach((yDataset: number[], index: number) => datasetValues.push({
      label: this.datasetLabels[index],
      data: yDataset,
      backgroundColor: this.chartType === 'line' ?
        this.graphColors[index] : this.graphColors.slice(0, yDataset.length),
      borderColor: this.chartType === 'line' ?
        this.graphColors[index] : this.graphColors.slice(0, yDataset.length),
      tension: this.tension[index]
    }));

    const scalesValues = this.chartType !== 'line' ? {} :
      {
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
      };

    return new Chart('canvas', {
      type: this.chartType !== 'table' ? this.chartType : 'line',
      options: {
        animation: false,
        scales: scalesValues,
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
