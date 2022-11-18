import { Component, OnInit } from '@angular/core';

type DiagramType = {
  id: number,
  text: string,
  selected: boolean
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  dropdownOpen: boolean = false;
  diagramTypes: DiagramType[] = [
    {id: 0, text: 'Number of sorted cards', selected: false},
    {id: 1, text: 'Number of not recognized cards', selected: false},
    {id: 2, text: 'Selected category', selected: false}
  ];

  constructor() { }

  ngOnInit(): void {
  }

  toggleSelectDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectDiagramType(typeId: number) {
    this.diagramTypes.forEach(type => {
      type.selected = type.id === typeId;
    });
  }

}
