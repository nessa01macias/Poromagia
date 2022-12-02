import { Component, OnInit } from '@angular/core';
import {HttpService} from "../_services/http.service";
import {SortingCategory} from "../_utils/SortingCategory";
import {MessageService} from "../_services/message.service";


/**
 * component to start and stop the machine with given sorting values
 */
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

  private lowerBoundaryCursorPosition: number = 0;
  private upperBoundaryCursorPosition: number = 0;
  readonly maxInputLength: number = 13;

  /* keys and values for local storage */
  private readonly machineStatusKey = 'MACHINE_STATUS';
  private readonly statusKey = 'status';
  private readonly categoryKey = 'category';
  private readonly lowerKey = 'lower';
  private readonly upperKey = 'upper';
  private readonly stopStatusValue = 'stopped';
  private readonly runningStatusValue = 'running';

  /**
   * reads the machine status from local storage and sets the values accordingly
   * @param httpService service to handle sending http requests to the server
   * @param messageService service to display messages
   */
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

  /**
   * adds a click event listener to the whole page to hide the touch keyboard when clicking next to it
   */
  ngOnInit(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      this.hideKeyboard(event);
    });
  }

  /**
   * getter for messageService; used for testing
   */
  getMessageService(): MessageService {
    return this.messageService;
  }

  /**
   * getter for httpService; used for testing
   */
  getHttpService(): HttpService {
    return this.httpService;
  }

  /**
   * changes the selected category
   * @param categoryName the name of the category the user selected
   */
  selectCategory(categoryName: string): void {
    if (this.machineStopped) {
      this.sortingCategories.forEach(cat => cat.selected = cat.name === categoryName);
      this.selectedCatIndex = this.sortingCategories.findIndex(cat => cat.name === categoryName);
    }
  }

  /**
   * checks if the currently selected category is configurable (if the lower and upper boundary can be edited)
   */
  getConfigurable(): boolean {
    const selectedCategory = this.sortingCategories[this.selectedCatIndex];
    return selectedCategory ? selectedCategory.configurable : false;
  }

  /**
   * calls the http service to send a start request with the given sorting values (category, lower and upper boundary) to the backend
   * and saves the machine status and the sorting values in the local storage
   */
  startSorting(): void {
    const selectedCategory = this.sortingCategories[this.selectedCatIndex];
    if (selectedCategory) {
      // make sure boundary values are numbers before sending http request
      this.lowerBoundary = (this.lowerBoundary.match(/^[0-9]*(?:\.[0-9]*)?/g) || []).join('');
      this.upperBoundary = (this.upperBoundary.match(/^[0-9]*(?:\.[0-9]*)?/g) || []).join('');

      if (this.selectedCatIndex === 2) {
        this.httpService.startSorting(selectedCategory.name, true, false);
      } else {
        this.httpService.startSorting(selectedCategory.name, +this.lowerBoundary, +this.upperBoundary);
      }
      this.machineStopped = false;
      localStorage.setItem(this.machineStatusKey, JSON.stringify({[this.statusKey]: this.runningStatusValue,
        [this.categoryKey]: this.selectedCatIndex, [this.lowerKey]: this.lowerBoundary, [this.upperKey]: this.upperBoundary}));
      this.messageService.add('Machine was started', 'SUCCESS', 3000);
    } else {
      this.messageService.add("Cannot start sorting - no sorting category selected", 'ERROR', 5000);
    }
  }

  /**
   * calls the http service to send a stop request to the backend and saves the machine status in the local storage
   */
  pauseSorting(): void {
    this.httpService.pauseSorting();
    this.machineStopped = true;
    localStorage.setItem(this.machineStatusKey, JSON.stringify({[this.statusKey]: this.stopStatusValue}));
    this.messageService.add('Machine was stopped', 'SUCCESS', 3000);
  }

  /**
   * displays the touch keyboard and gets the cursor position if a user clicks in the lower boundary input field
   * @param event the click event containing the click target
   */
  editLowerBoundary(event: any): void {
    this.keyboardDisplayed = true;
    this.editingLowerBoundary = true;
    this.editingUpperBoundary = false;
    this.lowerBoundaryCursorPosition = event.target.selectionStart;
  }

  /**
   * displays the touch keyboard and gets the cursor position if a user clicks in the upper boundary input field
   * @param event the click event containing the click target
   */
  editUpperBoundary(event: any): void {
    this.keyboardDisplayed = true;
    this.editingUpperBoundary = true;
    this.editingLowerBoundary = false;
    this.upperBoundaryCursorPosition = event.target.selectionStart;
  }

  /**
   * edits the lower or upper boundary according to the pressed button in the touch keyboard
   * @param pressedKey the key the user pressed on the touch keyboard
   */
  enterKeyboardValue(pressedKey: string): void {
    if (!this.editingLowerBoundary && !this.editingUpperBoundary) return;

    // make sure the input value is not longer than the maximum allowed input length
    if (this.editingLowerBoundary && this.lowerBoundary.length >= this.maxInputLength
      || this.editingUpperBoundary && this.upperBoundary.length >= this.maxInputLength) {
      this.messageService.add("Too long input - maximum input length is " + this.maxInputLength + " characters", 'WARNING', 4000);
      return;
    }

    // splits the value to edit at the current cursor position
    let editedValuePre = this.editingLowerBoundary ? this.lowerBoundary.substring(0, this.lowerBoundaryCursorPosition)
      : this.upperBoundary.substring(0, this.upperBoundaryCursorPosition);
    let editedValuePost = this.editingLowerBoundary ? this.lowerBoundary.substring(this.lowerBoundaryCursorPosition || 0)
      : this.upperBoundary.substring(this.upperBoundaryCursorPosition || 0);

    // keeps track of the cursor position to save the new cursor position afterwards
    let cursorPositionChange: number = 0;

    // edits the input value before the cursor according to the pressed button
    switch (pressedKey) {
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9': case '0':
        editedValuePre += pressedKey;
        cursorPositionChange++;
        break;
      case '.':
        if (!editedValuePre.includes('.') && !editedValuePost.includes('.')) {
          // only add . if the input value doesn't contain it yet (only allow one . per input value)
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
      // make sure cursor position is positive value
      this.lowerBoundaryCursorPosition = Math.max(this.lowerBoundaryCursorPosition, 0);
      this.lowerBoundary = editedValuePre + editedValuePost;
    }
    else if (this.editingUpperBoundary) {
      this.upperBoundaryCursorPosition = this.upperBoundaryCursorPosition !== undefined ?
        this.upperBoundaryCursorPosition + cursorPositionChange : cursorPositionChange;
      // make sure cursor position is positive value
      this.upperBoundaryCursorPosition = Math.max(this.upperBoundaryCursorPosition, 0);
      this.upperBoundary = editedValuePre + editedValuePost
    }
  }

  /**
   * handles user input without the touch keyboard in the lower boundary input field
   * makes sure that new lower boundary value only contains numbers from 0 to 9 and maximum one '.' and user input doesn't exceed the maximum input length
   */
  handleLowerBoundaryInput(): void {
    this.lowerBoundary = (this.lowerBoundary.match(/^[0-9]*(?:\.[0-9]*)?/g) || []).join('');
    if (this.lowerBoundary.length > this.maxInputLength) {
      this.lowerBoundary = this.lowerBoundary.substring(0, this.maxInputLength);
    }
  }

  /**
   * handles user input without the touch keyboard in the upper boundary input field
   * makes sure that new upper boundary value only contains numbers from 0 to 9 and maximum one '.' and user input doesn't exceed the maximum input length
   */
  handleUpperBoundaryInput(): void {
    this.upperBoundary = (this.upperBoundary.match(/^[0-9]*(?:\.[0-9]*)?/g) || []).join('');
    if (this.upperBoundary.length > this.maxInputLength) {
      this.upperBoundary = this.upperBoundary.substring(0, this.maxInputLength);
    }
  }

  /**
   * get the css classes of the given input field depending on if the field is being edited and on the validity of the input data
   * @param lowerBoundary true if the input classes for the lower boundary input field are requested; false if the classes for the upper boundary field are requested
   */
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

  /**
   * hides the keyboard if the target of the click event doesn't have the class 'keyboardDisplay'
   * @param event click event containing the click target
   */
  private hideKeyboard(event: Event): void {
    // @ts-ignore
    if (!event.target || !event.target.classList || !event.target.classList.toString().includes('keyboardDisplay')) {
      this.keyboardDisplayed = false;
      this.editingLowerBoundary = false;
      this.editingUpperBoundary = false;
    }
  }

}
