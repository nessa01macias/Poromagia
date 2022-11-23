import {Component, OnInit} from '@angular/core';
import {functionName, HttpService} from "../_services/http.service";
import {chartType} from "../graph/graph.component";

type DiagramType = {
  id: number,
  chartType: chartType,
  text: string,
  selected: boolean,
  endpointMethod: functionName,
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  dropdownOpen: boolean = false;
  diagramTypes: DiagramType[] = [
    {id: 0, chartType: 'line', text: 'Sorted cards', selected: false, endpointMethod: 'ALL_CARDS'},
    {id: 1, chartType: 'line', text: 'Recognized cards', selected: false, endpointMethod: 'RECOGNIZED_CARDS'},
    {id: 2, chartType: 'line', text: 'Not recognized cards', selected: false, endpointMethod: 'NOT_RECOGNIZED_CARDS'},
    {id: 3, chartType: 'line', text: 'Cards sorted in boxes', selected: false, endpointMethod: 'CARDS_IN_BOXES'},
    {id: 4, chartType: 'doughnut', text: 'Cards per category', selected: false, endpointMethod: 'CATEGORIES_COUNT'},
    {id: 5, chartType: 'table', text: 'Start and end time for categories', selected: false, endpointMethod: 'SORTING_DATA_CATEGORIES'}
  ];

  fromDate: Date | undefined = undefined;
  toDate: Date | undefined = undefined;

  chartType!: chartType;
  graphTitle!: string;
  xAxisTitle!: string;
  yAxisTitle: string = "Number of cards";
  xAxisValues!: string[];
  yAxisValues!: number[][];
  datasetLabels!: string[];
  tension!: number[];
  tableValues!: string[][];

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
  }

  toggleSelectDropdown(): void {
    if (this.dropdownOpen && this.fromDate && this.toDate) {
      const selectedType = this.diagramTypes.find(type => type.selected);
      if (selectedType && selectedType.endpointMethod) {
        this.xAxisValues = selectedType.chartType === 'line' ? this.getDates(this.fromDate, this.toDate) : [];
        this.yAxisValues = [];
        this.datasetLabels = [];
        this.tension = [];

        this.httpService.callStatisticsEndpoint(selectedType.endpointMethod, this.fromDate, this.toDate)
          .subscribe(res => {
            const responseProperties = Object.getOwnPropertyNames(res[0]);
            const datasetValues: number[][] = [];
            for (let i = 1; i < responseProperties.length; i++) {
              datasetValues.push([]);
              this.datasetLabels.push(responseProperties[i]);
              this.tension.push(0);
              if (selectedType.chartType === 'doughnut') {
                this.xAxisValues.push(responseProperties[i]);
                datasetValues[0].push(res[0][responseProperties[i]]);
              }
            }

            if (selectedType.chartType === 'line') {
              for (let date of this.xAxisValues) {
                const numberOfCards = res.find((data: any) => data._id === date);
                for (let i = 1; i < responseProperties.length; i++) {
                  datasetValues[i - 1].push(numberOfCards ? numberOfCards[responseProperties[i]] : 0);
                }
              }
            } else if (selectedType.chartType === 'table') {
              this.tableValues = [];
              for (let dataset of res) {
                let tableDataset: string[] = [];
                for (let i = 1; i < responseProperties.length; i++) {
                  tableDataset.push(dataset[responseProperties[i]]);
                }
                this.tableValues.push(tableDataset);
              }
            }

            this.chartType = selectedType.chartType;
            this.graphTitle = selectedType.text;
            this.xAxisTitle = 'Dates';
            this.yAxisValues = datasetValues;

            this.dropdownOpen = !this.dropdownOpen;
          });
      }
    } else {
      this.dropdownOpen = !this.dropdownOpen;
    }
  }

  selectDiagramType(typeId: number) {
    this.diagramTypes.forEach(type => {
      type.selected = type.id === typeId;
    });
  }

  typeIsSelected(): boolean {
    return this.diagramTypes.findIndex(type => type.selected) >= 0;
  }

  getDatesValidity(): boolean {
    return !this.fromDate || !this.toDate || this.fromDate < this.toDate;
  }

  getDates(start: Date, end: Date): string[] {
    let dates = [];
    for (let dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
      const month = dt.getMonth() + 1;
      const day = dt.getDate();
      dates.push(dt.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day));
    }
    return dates;
  };

}
