import { Component, OnInit } from '@angular/core';
import {HttpService} from "../_services/http.service";
import {SortingCategory} from "../_utils/SortingCategory";


@Component({
  selector: 'app-machine-init',
  templateUrl: './machine-init.component.html',
  styleUrls: ['./machine-init.component.scss']
})
export class MachineInitComponent implements OnInit {

  sortingCategories: SortingCategory[] = [SortingCategory.PRICE, SortingCategory.STOCK, SortingCategory.WANTED];

  lowerBoundary: string = '';
  upperBoundary: string = '';
  machineStopped: boolean = true;
  selectedCatIndex: number = 0;

  keyboardDisplayed: boolean = false;
  editingLowerBoundary: boolean = false;
  editingUpperBoundary: boolean = false;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      this.hideKeyboard(event);
    });
  }

  selectCategory(categoryName: string): void {
    this.sortingCategories.forEach(cat => cat.selected = cat.name === categoryName);
    this.selectedCatIndex = this.sortingCategories.findIndex(cat => cat.name === categoryName);
  }

  getConfigurable(): boolean {
    const selectedCategory = this.sortingCategories[this.selectedCatIndex];
    return selectedCategory ? selectedCategory.configurable : false;
  }

  startSorting(): void {
    const selectedCategory = this.sortingCategories[this.selectedCatIndex];
    if (selectedCategory) {
      this.httpService.startSorting(selectedCategory.name, +this.lowerBoundary, +this.upperBoundary);
      this.machineStopped = false;
    } else {
      //TODO: error
    }
  }

  pauseSorting(): void {
    this.httpService.pauseSorting();
    this.machineStopped = true;
  }

  editLowerBoundary(): void {
    this.keyboardDisplayed = true;
    this.editingLowerBoundary = true;
    this.editingUpperBoundary = false;
  }

  editUpperBoundary(): void {
    this.keyboardDisplayed = true;
    this.editingUpperBoundary = true;
    this.editingLowerBoundary = false;
  }

  enterKeyboardValue(pressedKey: string): void {
    if (!this.editingLowerBoundary && !this.editingUpperBoundary) return;
    let editedValue = this.editingLowerBoundary ? this.lowerBoundary : this.upperBoundary;
    switch (pressedKey) {
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9': case '0':
        editedValue += pressedKey;
        break;
      case '.':
        if (!editedValue.includes('.')) {
          editedValue += pressedKey;
        }
        break;
      case 'Delete':
        editedValue = editedValue.substring(0, editedValue.length -1);
        break;
      case 'Ok':
        this.editingLowerBoundary = false;
        this.editingUpperBoundary = false;
        this.keyboardDisplayed = false;
    }
    if (this.editingLowerBoundary) this.lowerBoundary = editedValue;
    else if (this.editingUpperBoundary) this.upperBoundary = editedValue;
  }

  handleLowerBoundaryInput(): void {
    this.lowerBoundary = (this.lowerBoundary.match(/^[0-9]*(?:\.[0-9]*)?/g) || []).join('');
  }

  handleUpperBoundaryInput(): void {
    this.upperBoundary = (this.upperBoundary.match(/^[0-9]*(?:\.[0-9]*)?/g) || []).join('');
  }

  hideKeyboard(event: Event): void {
    // @ts-ignore
    if (!event.target || !event.target.classList || !event.target.classList.toString().includes('keyboardDisplay')) {
      this.keyboardDisplayed = false;
      this.editingLowerBoundary = false;
      this.editingUpperBoundary = false;
    }
  }

}
