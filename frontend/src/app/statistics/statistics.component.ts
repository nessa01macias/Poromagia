import {Component} from '@angular/core';
import {functionName, HttpService} from "../_services/http.service";
import {chartType} from "../graph/graph.component";
import {MessageService} from "../_services/message.service";
import {io, Socket} from "socket.io-client";
import {environment} from "../../environments/environment";

type DiagramType = {
  id: number,
  chartType: chartType,
  text: string,
  selected: boolean,
  endpointMethod: functionName,
  combinableWith: number[]
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {

  dropdownOpen: boolean = false;
  diagramTypes: DiagramType[] = [
    {id: 0, chartType: 'line', text: 'Sorted cards', selected: false, endpointMethod: 'ALL_CARDS', combinableWith: [1, 2, 3]},
    {id: 1, chartType: 'line', text: 'Recognized cards', selected: false, endpointMethod: 'RECOGNIZED_CARDS', combinableWith: [0, 2, 3]},
    {id: 2, chartType: 'line', text: 'Not recognized cards', selected: false, endpointMethod: 'NOT_RECOGNIZED_CARDS', combinableWith: [0, 1, 3]},
    {id: 3, chartType: 'line', text: 'Cards sorted in boxes', selected: false, endpointMethod: 'CARDS_IN_BOXES', combinableWith: [0, 1, 2]},
    {id: 4, chartType: 'doughnut', text: 'Cards per category', selected: false, endpointMethod: 'CATEGORIES_COUNT', combinableWith: []},
    {id: 5, chartType: 'table', text: 'Start and end time for categories', selected: false, endpointMethod: 'SORTING_DATA_CATEGORIES', combinableWith: []},
    {id: 6, chartType: 'bar', text: 'Time to sort a card', selected: false, endpointMethod: 'RECOGNIZE_TIMES', combinableWith: []}
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

  private socket: Socket | undefined;

  constructor(private httpService: HttpService, private messageService: MessageService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.socket.on('error', (data: string) => {
      this.messageService.add(JSON.parse(data).message, 'ERROR', 5000);
    });
  }

  toggleSelectDropdown(): void {
    if (this.dropdownOpen && this.fromDate && this.toDate) {
      const selectedTypes = this.diagramTypes.filter(type => type.selected);
      this.xAxisValues = selectedTypes[0].chartType === 'line' ? this.getDates(this.fromDate, this.toDate) : [];
      this.yAxisValues = [];
      this.datasetLabels = [];
      this.tension = [];
      const datasetValues: number[][] = [];
      let dataReadCount: number = 0;

      selectedTypes.forEach(selectedType => {
        if (selectedType && selectedType.endpointMethod && this.fromDate && this.toDate) {
          this.httpService.callStatisticsEndpoint(selectedType.endpointMethod, this.fromDate, this.toDate)
            .subscribe(res => {
              console.debug("http response: " + JSON.stringify(res));
              if (!res || !res.data || res.data.length <= 0) {
                this.messageService.add("No data in this period of time", 'WARNING', 5000);
              }
              const responseProperties = res && res.data && res.data.length > 0 ?
                Object.getOwnPropertyNames(res.data[0]) : [];
              for (let i = 1; i < responseProperties.length; i++) {
                datasetValues.push([]);
                this.datasetLabels.push(res.labels && res.labels[i-1] ? res.labels[i-1] : responseProperties[i]);
                this.tension.push(0);
                if (selectedType.chartType === 'doughnut') {
                  this.xAxisValues.push(res.labels && res.labels[i-1] ? res.labels[i-1] : responseProperties[i]);
                  datasetValues[0].push(res.data[0][responseProperties[i]]);
                }
              }

              if (selectedType.chartType === 'bar') {
                for (let resDataset of res.data) {
                  this.xAxisValues.push(resDataset._id);
                }
              }

              if (selectedType.chartType === 'line' || selectedType.chartType === 'bar') {
                for (let date of this.xAxisValues) {
                  const numberOfCards = res.data.find((data: any) => data._id === date);
                  for (let i = 1; i < responseProperties.length; i++) {
                    const index = datasetValues.length - responseProperties.length + i;
                    datasetValues[index].push(numberOfCards ? numberOfCards[responseProperties[i]] : 0);
                  }
                }
              } else if (selectedType.chartType === 'table') {
                this.setTableData(res.data, responseProperties);
              }

              this.chartType = selectedType.chartType;
              this.xAxisTitle = 'Dates';
              this.yAxisValues = datasetValues;
              dataReadCount++;

              if (selectedTypes.length === 1) {
                this.graphTitle = selectedType.text;
              } else {
                this.graphTitle = "Sorted cards";
              }
              if (dataReadCount >= selectedTypes.length) {
                // all data read and written to dataset
                this.dropdownOpen = !this.dropdownOpen;
              }
            });
        }
      });
    } else {
      this.dropdownOpen = !this.dropdownOpen;
    }
  }

  setTableData(httpResponse: any, responseProperties: any): void {
    this.tableValues = [];
    for (let dataset of httpResponse) {
      let tableDataset: string[] = [];
      for (let i = 1; i < responseProperties.length; i++) {
        let dateString = dataset[responseProperties[i]];
        if (dateString !== undefined && dateString !== null && responseProperties[i] === 'Time') {
          const hours = Math.floor(dateString / (60 * 60));
          const minutes = Math.floor((dateString - hours * 60 * 60) / 60);
          const seconds = dateString - hours * 60 * 60 - minutes * 60;
          tableDataset.push(hours.toString().padStart(2, '0') + ':'
            + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'));
        } else {
          tableDataset.push(dateString && typeof dateString === 'string' ?
            dateString.substring(0, 10) + ' ' + dateString.substring(11, 19) : dateString);
        }
      }
      this.tableValues.push(tableDataset);
    }
  }

  selectDiagramType(typeId: number) {
    const clickedType = this.diagramTypes.find(type => type.id === typeId);
    if (clickedType) {
      this.diagramTypes.forEach(type => {
        type.selected = !type.selected && type.id === typeId
          || type.selected && clickedType.combinableWith.includes(type.id);
      });
    }
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
