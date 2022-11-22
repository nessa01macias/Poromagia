import {Component, OnInit} from '@angular/core';
import {HttpService} from "../_services/http.service";
import {Observable} from "rxjs";

type DiagramType = {
  id: number,
  text: string,
  selected: boolean,
  endpointMethod: ((fromDate: Date, toDate: Date) => Observable<any>)
    | ((fromDate: Date, toDate: Date, boxId: number) => Observable<any>)
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  dropdownOpen: boolean = false;
  diagramTypes: DiagramType[] = [
    {id: 0, text: 'Number of sorted cards', selected: false, endpointMethod: this.httpService.getNumberOfAllCards},
    {id: 1, text: 'Number of recognized cards', selected: false, endpointMethod: this.httpService.getNumberOfRecognizedCards},
    {id: 2, text: 'Number of not recognized cards', selected: false, endpointMethod: this.httpService.getNumberOfNotRecognizedCards},
    {id: 3, text: 'Number of cards sorted in boxes', selected: false, endpointMethod: this.httpService.getNumberOfCardsInBox},
    {id: 4, text: 'Number of cards per category', selected: false, endpointMethod: this.httpService.getCategoriesCount}, //TODO: no graph
    {id: 5, text: 'Start and end time for categories', selected: false, endpointMethod: this.httpService.getSortingDataCategories}, //TODO: no graph
    //{id: 6, text: 'Average time to sort one card', selected: false},
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
      this.xAxisValues = this.getDates(this.fromDate, this.toDate);
      const datasetValues: number[] = [];
      this.yAxisValues = [];
      this.httpService.getNumberOfAllCards(this.fromDate, this.toDate) //TODO: use defined method for selected type
        .subscribe(res => {
          //TODO: get number of response data, add label and dataset for each data
          for (let date of this.xAxisValues) {
            const numberOfCards = res.find((data: {_id: string, count: number}) => data._id === date);
            datasetValues.push(numberOfCards ? numberOfCards.count : 0);
          }
          this.yAxisValues.push(datasetValues);
          this.graphTitle = this.diagramTypes.find(type => type.selected)!.text;
          this.yAxisTitle = 'Number of cards'; //TODO
          this.xAxisTitle = 'Dates';
          this.datasetLabels = [this.diagramTypes.find(type => type.selected)!.text]; //TODO: only call find once
          this.tension = [0];
          this.dropdownOpen = !this.dropdownOpen;
        });
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
