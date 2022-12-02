import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export type functionName = 'ALL_CARDS' | 'RECOGNIZED_CARDS' | 'NOT_RECOGNIZED_CARDS' | 'CARDS_IN_BOX'
  | 'CARDS_IN_BOXES' | 'CATEGORIES_COUNT' | 'SORTING_DATA_CATEGORIES' | 'RECOGNIZE_TIMES';


/**
 * service for handling http communication between the frontend and the backend
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  /**
   * sends start request to the server to start the machine
   * @param selectedCategory the category the user selected
   * @param lowerBoundary a value determining the boundary value between the first and second box
   * @param upperBoundary a value determining the boundary value between the second and third box
   */
  startSorting(selectedCategory: string, lowerBoundary: number | boolean, upperBoundary: number | boolean): void {
    this.http.post("https://poromagia.herokuapp.com/start",
      JSON.stringify({category: selectedCategory, lowerBoundary, upperBoundary}), httpOptions)
      .subscribe(res => console.debug("start sorting response: " + JSON.stringify(res)));
  }

  /**
   * sends stop request to the server to stop the machine
   */
  pauseSorting(): void {
    this.http.post("https://poromagia.herokuapp.com/stop", '', httpOptions)
      .subscribe(res => console.debug("pause sorting response: " + JSON.stringify(res)));
  }

  /**
   * generic function to call one of the statistics endpoints according to the given function key
   * @param func the key of the function to call
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   * @param args list of additional arguments, in case the called function requires more than two arguments
   */
  callStatisticsEndpoint(func: functionName, fromDate: Date, toDate: Date, ...args: any[]): Observable<any> {
    switch (func) {
      case 'ALL_CARDS': return this.getNumberOfAllCards(fromDate, toDate);
      case 'RECOGNIZED_CARDS': return this.getNumberOfRecognizedCards(fromDate, toDate);
      case 'NOT_RECOGNIZED_CARDS': return this.getNumberOfNotRecognizedCards(fromDate, toDate);
      case 'CARDS_IN_BOX': return this.getNumberOfCardsInBox(fromDate, toDate, args[0]);
      case 'CARDS_IN_BOXES': return this.getNumberOfCardsInBoxes(fromDate, toDate);
      case 'CATEGORIES_COUNT': return this.getCategoriesCount(fromDate, toDate);
      case 'SORTING_DATA_CATEGORIES': return this.getSortingDataCategories(fromDate, toDate);
      case 'RECOGNIZE_TIMES': return this.getRecognizeTimes(fromDate, toDate);
    }
  }

  /**
   * sends an http request to the server to get the number of sorted cards per day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  getNumberOfAllCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("https://poromagia.herokuapp.com/cardsCount/all?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of recognized cards per day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  getNumberOfRecognizedCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("https://poromagia.herokuapp.com/cardsCount/recognized?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of not recognized cards per day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  getNumberOfNotRecognizedCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("https://poromagia.herokuapp.com/cardsCount/notRecognized?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of cards in the box with the given id per day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   * @param boxId
   */
  getNumberOfCardsInBox(fromDate: Date, toDate: Date, boxId: number): Observable<any> {
    return this.http.get("https://poromagia.herokuapp.com/cardsCount/boxes/" + boxId
      + "?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of sorted cards per box and day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  getNumberOfCardsInBoxes(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("https://poromagia.herokuapp.com/cardsCount/boxes"
      + "?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of cards by the time it took to recognize them in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  getRecognizeTimes(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("https://poromagia.herokuapp.com/recognizeTimes"
      + "?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of times the machine ran with the different sorting categories in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  getCategoriesCount(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("https://poromagia.herokuapp.com/cardsCount/categories?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the start and stop dates of the machine in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  getSortingDataCategories(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("https://poromagia.herokuapp.com/sortingData/categories?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

}
