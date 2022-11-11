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

  lowerBorder: number = 0;
  upperBorder: number = 1;
  machineStopped: boolean = true;
  selectedCatIndex: number = 0;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
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
      this.httpService.startSorting(selectedCategory.name, this.lowerBorder, this.upperBorder);
      this.machineStopped = false;
    } else {
      //TODO: error
    }
  }

  pauseSorting(): void {
    this.httpService.pauseSorting();
    this.machineStopped = true;
  }

}
