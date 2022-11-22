import {Component, OnInit} from '@angular/core';
import {functionName, HttpService} from "../_services/http.service";

type DiagramType = {
  id: number,
  text: string,
  selected: boolean,
  endpointMethod: functionName
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  dropdownOpen: boolean = false;
  diagramTypes: DiagramType[] = [
    {id: 0, text: 'Number of sorted cards', selected: false, endpointMethod: 'ALL_CARDS'},
    {id: 1, text: 'Number of recognized cards', selected: false, endpointMethod: 'RECOGNIZED_CARDS'},
    {id: 2, text: 'Number of not recognized cards', selected: false, endpointMethod: 'NOT_RECOGNIZED_CARDS'},
    {id: 3, text: 'Number of cards sorted in boxes', selected: false, endpointMethod: 'CARDS_IN_BOXES'},
    {id: 4, text: 'Number of cards per category', selected: false, endpointMethod: 'CATEGORIES_COUNT'}, //TODO: no graph
    {id: 5, text: 'Start and end time for categories', selected: false, endpointMethod: 'SORTING_DATA_CATEGORIES'}, //TODO: no graph
  ];

  fromDate: Date | undefined = undefined;
  toDate: Date | undefined = undefined;

  graphTitle!: string;
  xAxisTitle!: string;
  yAxisTitle!: string;
  xAxisValues!: string[];
  yAxisValues!: number[][];
  datasetLabels!: string[];
  tension!: number[];

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
  }

  toggleSelectDropdown(): void {
    if (this.dropdownOpen && this.fromDate && this.toDate) {
      const selectedType = this.diagramTypes.find(type => type.selected);
      if (selectedType && selectedType.endpointMethod) {
        this.xAxisValues = this.getDates(this.fromDate, this.toDate);
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
            }

            for (let date of this.xAxisValues) {
              const numberOfCards = res.find((data: {_id: string, count: number}) => data._id === date);
              for (let i = 1; i < responseProperties.length; i++) {
                datasetValues[i - 1].push(numberOfCards ? numberOfCards[responseProperties[i]] : 0);
              }
            }

            this.yAxisValues = datasetValues;
            this.graphTitle = selectedType.text;
            this.yAxisTitle = 'Number of cards'; //TODO
            this.xAxisTitle = 'Dates';

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
