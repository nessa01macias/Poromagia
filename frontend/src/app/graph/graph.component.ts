import {Component, Input, OnInit} from '@angular/core';
import {Chart, registerables} from 'chart.js';
import {MessageService} from "../_services/message.service";


export type chartType = 'line' | 'doughnut' | 'table' | 'bar';

/**
 * component to display charts
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
  private maxGraphNumber: number = 8;
  private graphColors: string[] = ['#1f54ff', '#8aff1c', '#ff9b2e', '#f81b2d',
    '#4ed5ff', '#c93dff', '#000000', '#0ac00c'];

  constructor(private messageService: MessageService) {
    Chart.register(...registerables);
  }

  /**
   * checks the input data, formats it and displays the corresponding graph
   */
  ngOnInit(): void {
    // fill tension array with default values if it contains less values than datasets
    if (this.tension.length < this.yAxisValues.length) {
      for (let i: number = this.tension.length; i < this.datasetLabels.length; i++) {
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
      this.yAxisValues = this.yAxisValues.slice(0, this.maxGraphNumber);
    }

    this.getChart();
  }

  /**
   * getter for messageService; used for testing
   */
  getMessageService(): MessageService {
    return this.messageService;
  }

  /**
   * parses the input data and creates a chart according to it (chart can be of different types and it can contain multiple datasets)
   * @return a chart according to the given input values
   */
  private getChart(): void {
    const datasetValues: any = [];
    this.yAxisValues.forEach((yDataset: number[], index: number) => datasetValues.push({
      label: this.datasetLabels[index],
      data: yDataset,
      backgroundColor: this.chartType === 'line' || this.chartType === 'bar' ?
        this.graphColors[index] : this.graphColors.slice(0, yDataset.length),
      borderColor: this.chartType === 'line' || this.chartType === 'bar' ?
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
          },
          beginAtZero: true
        }
      };

    new Chart('canvas', {
      type: this.chartType !== 'table' ? this.chartType : 'line',
      options: {
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
