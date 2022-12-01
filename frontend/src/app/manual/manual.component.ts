import { Component } from '@angular/core';


/**
 * component for displaying the user manual
 */
@Component({
  selector: 'app-manual',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.scss']
})
export class ManualComponent {

  // contains a boolean value for each dropdown indicating if the dropdown is open (true) or not (false)
  dropdownOpenValues = [false, false, false];

  constructor() { }

  /**
   * toggles the dropdown status of the dropdown element at the given index to display or hide the content
   * @param dropdownIndex the index of the dropdown element
   */
  toggleDropdownStatus(dropdownIndex: number): void {
    this.dropdownOpenValues[dropdownIndex] = !this.dropdownOpenValues[dropdownIndex];
  }

}
