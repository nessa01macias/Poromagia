import { Component, OnInit } from '@angular/core';
import {HttpService} from "../_services/http.service";
import {SortingCategory} from "../_utils/SortingCategory";
import {MessageService} from "../_services/message.service";


@Component({
  selector: 'app-machine-init',
  templateUrl: './machine-init.component.html',
  styleUrls: ['./machine-init.component.scss']
})
export class MachineInitComponent implements OnInit {

  readonly sortingCategories: SortingCategory[] = [SortingCategory.PRICE, SortingCategory.STOCK, SortingCategory.WANTED];

  lowerBoundary: string = '';
  upperBoundary: string = '';
  machineStopped: boolean = true;
  selectedCatIndex: number = 0;

  keyboardDisplayed: boolean = false;
  editingLowerBoundary: boolean = false;
  editingUpperBoundary: boolean = false;
  readonly keyboardValues: string[][] = [['1', '2', '3', '4', '5', '6', '7'], ['8', '9', '0', '.', 'Delete', 'Ok']];

  private lowerBoundaryCursorPosition?: number;
  private upperBoundaryCursorPosition?: number;
  readonly maxInputLength: number = 13;

  /* keys and values for local storage */
  private readonly machineStatusKey = 'MACHINE_STATUS';
  private readonly statusKey = 'status';
  private readonly categoryKey = 'category';
  private readonly lowerKey = 'lower';
  private readonly upperKey = 'upper';
  private readonly stopStatusValue = 'stopped';
  private readonly runningStatusValue = 'running';

  constructor(private httpService: HttpService, private messageService: MessageService) {
    const storedMachineStatus = localStorage.getItem(this.machineStatusKey);
    if (storedMachineStatus) {
      const machineStatus = JSON.parse(storedMachineStatus);
      if (this.stopStatusValue === machineStatus[this.statusKey]) {
        this.machineStopped = true;
      } else if (this.runningStatusValue === machineStatus[this.statusKey]) {
        this.machineStopped = false;
        this.lowerBoundary = machineStatus[this.lowerKey];
        this.upperBoundary = machineStatus[this.upperKey];
        this.selectedCatIndex = machineStatus[this.categoryKey];
        for (let i = 0; i < this.sortingCategories.length; i++) {
          this.sortingCategories[i].selected = i === this.selectedCatIndex;
        }
      }
    }
  }

  ngOnInit(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      this.hideKeyboard(event);
    });
  }

  selectCategory(categoryName: string): void {
    if (this.machineStopped) {
      this.sortingCategories.forEach(cat => cat.selected = cat.name === categoryName);
      this.selectedCatIndex = this.sortingCategories.findIndex(cat => cat.name === categoryName);
    }
  }

  getConfigurable(): boolean {
    const selectedCategory = this.sortingCategories[this.selectedCatIndex];
    return selectedCategory ? selectedCategory.configurable : false;
  }

  startSorting(): void {
    const selectedCategory = this.sortingCategories[this.selectedCatIndex];
    if (selectedCategory) {
      // make sure boundary values are numbers before sending http request
      this.lowerBoundary = (this.lowerBoundary.match(/^[0-9]*(?:\.[0-9]*)?/g) || []).join('');
      this.upperBoundary = (this.upperBoundary.match(/^[0-9]*(?:\.[0-9]*)?/g) || []).join('');

      this.httpService.startSorting(selectedCategory.name, +this.lowerBoundary, +this.upperBoundary);
      this.machineStopped = false;
      localStorage.setItem(this.machineStatusKey, JSON.stringify({[this.statusKey]: this.runningStatusValue,
        [this.categoryKey]: this.selectedCatIndex, [this.lowerKey]: this.lowerBoundary, [this.upperKey]: this.upperBoundary}));
      this.messageService.add('Machine was started', 'SUCCESS', 3000);
    } else {
      this.messageService.add("Cannot start sorting - no sorting category selected", 'ERROR', 5000);
    }
  }

  pauseSorting(): void {
    this.httpService.pauseSorting();
    this.machineStopped = true;
    localStorage.setItem(this.machineStatusKey, JSON.stringify({[this.statusKey]: this.stopStatusValue}));
    this.messageService.add('Machine was stopped', 'SUCCESS', 3000);
  }

  editLowerBoundary(event: any): void {
    this.keyboardDisplayed = true;
    this.editingLowerBoundary = true;
    this.editingUpperBoundary = false;
    this.lowerBoundaryCursorPosition = event.target.selectionStart;
  }

  editUpperBoundary(event: any): void {
    this.keyboardDisplayed = true;
    this.editingUpperBoundary = true;
    this.editingLowerBoundary = false;
    this.upperBoundaryCursorPosition = event.target.selectionStart;
  }

  enterKeyboardValue(pressedKey: string): void {
    if (!this.editingLowerBoundary && !this.editingUpperBoundary) return;
    if (this.editingLowerBoundary && this.lowerBoundary.length >= this.maxInputLength
      || this.editingUpperBoundary && this.upperBoundary.length >= this.maxInputLength) {
      this.messageService.add("Too long input - maximum input length is " + this.maxInputLength + " characters", 'WARNING', 4000);
      return;
    }

    let editedValuePre = this.editingLowerBoundary ? this.lowerBoundary.substring(0, this.lowerBoundaryCursorPosition)
      : this.upperBoundary.substring(0, this.upperBoundaryCursorPosition);
    let editedValuePost = this.editingLowerBoundary ? this.lowerBoundary.substring(this.lowerBoundaryCursorPosition || 0)
      : this.upperBoundary.substring(this.upperBoundaryCursorPosition || 0);
    let cursorPositionChange: number = 0;

    switch (pressedKey) {
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9': case '0':
        editedValuePre += pressedKey;
        cursorPositionChange++;
        break;
      case '.':
        if (!editedValuePre.includes('.') && !editedValuePost.includes('.')) {
          editedValuePre += pressedKey;
          cursorPositionChange++;
        }
        break;
      case 'Delete':
        editedValuePre = editedValuePre.substring(0, editedValuePre.length - 1);
        cursorPositionChange--;
        break;
      case 'Ok':
        this.editingLowerBoundary = false;
        this.editingUpperBoundary = false;
        this.keyboardDisplayed = false;
        break;
      default:
        this.messageService.add("Invalid keyboard value", 'ERROR', 2000);
    }

    if (this.editingLowerBoundary) {
      this.lowerBoundaryCursorPosition = this.lowerBoundaryCursorPosition !== undefined ?
        this.lowerBoundaryCursorPosition + cursorPositionChange : cursorPositionChange;
      this.lowerBoundaryCursorPosition = Math.max(this.lowerBoundaryCursorPosition, 0);
      this.lowerBoundary = editedValuePre + editedValuePost;
    }
    else if (this.editingUpperBoundary) {
      this.upperBoundaryCursorPosition = this.upperBoundaryCursorPosition !== undefined ?
        this.upperBoundaryCursorPosition + cursorPositionChange : cursorPositionChange;
      this.upperBoundaryCursorPosition = Math.max(this.upperBoundaryCursorPosition, 0);
      this.upperBoundary = editedValuePre + editedValuePost
    }
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

  getInputCssClasses(lowerBoundary: boolean): string {
    let classes = 'keyboardDisplay';
    if (lowerBoundary && this.editingLowerBoundary || !lowerBoundary && this.editingUpperBoundary) {
      classes += ' editMode';
    }
    if (this.lowerBoundary && this.upperBoundary && +this.lowerBoundary >= +this.upperBoundary) {
      classes += ' invalid';
    }
    return classes;
  }

}
