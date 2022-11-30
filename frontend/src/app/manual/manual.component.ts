import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manual',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.scss']
})
export class ManualComponent implements OnInit {

  // contains a boolean value for each dropdown indicating if the dropdown is open (true) or not (false)
  dropdownOpenValues = [false, false, false];

  constructor() { }

  ngOnInit(): void {
  }

  toggleDropdownStatus(dropdownIndex: number): void {
    this.dropdownOpenValues[dropdownIndex] = !this.dropdownOpenValues[dropdownIndex];
  }

}
