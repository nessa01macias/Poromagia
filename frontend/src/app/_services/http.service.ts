import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

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
  startSorting(selectedCategory: string, lowerBoundary: number | boolean, upperBoundary: number | boolean): Observable<any> {
    return this.http.post(environment.SOCKET_ENDPOINT + "/start",
      JSON.stringify({category: selectedCategory, lowerBoundary, upperBoundary}), httpOptions);
  }

  /**
   * sends stop request to the server to stop the machine
   */
  pauseSorting(): Observable<any> {
    return this.http.post(environment.SOCKET_ENDPOINT + "/stop", '', httpOptions);
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
  private getNumberOfAllCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get(environment.SOCKET_ENDPOINT + "/cardsCount/all?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of recognized cards per day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  private getNumberOfRecognizedCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get(environment.SOCKET_ENDPOINT + "/cardsCount/recognized?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of not recognized cards per day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  private getNumberOfNotRecognizedCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get(environment.SOCKET_ENDPOINT + "/cardsCount/notRecognized?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of cards in the box with the given id per day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   * @param boxId
   */
  private getNumberOfCardsInBox(fromDate: Date, toDate: Date, boxId: number): Observable<any> {
    return this.http.get(environment.SOCKET_ENDPOINT + "/cardsCount/boxes/" + boxId
      + "?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of sorted cards per box and day in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  private getNumberOfCardsInBoxes(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get(environment.SOCKET_ENDPOINT + "/cardsCount/boxes"
      + "?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of cards by the time it took to recognize them in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  private getRecognizeTimes(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get(environment.SOCKET_ENDPOINT + "/recognizeTimes"
      + "?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the number of times the machine ran with the different sorting categories in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  private getCategoriesCount(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get(environment.SOCKET_ENDPOINT + "/cardsCount/categories?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  /**
   * sends an http request to the server to get the start and stop dates of the machine in the given time period
   * @param fromDate the start date of the requested time period
   * @param toDate the end date of the requested time period
   */
  private getSortingDataCategories(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get(environment.SOCKET_ENDPOINT + "/sortingData/categories?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

}
