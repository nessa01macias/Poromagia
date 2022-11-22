import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export type functionName = 'ALL_CARDS' | 'RECOGNIZED_CARDS' | 'NOT_RECOGNIZED_CARDS' | 'CARDS_IN_BOX'
  | 'CARDS_IN_BOXES' | 'CATEGORIES_COUNT' | 'SORTING_DATA_CATEGORIES';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  startSorting(selectedCategory: string, lowerBoundary: number, upperBoundary: number): void {
    this.http.post("http://localhost:3000/start",
      JSON.stringify({category: selectedCategory, lowerBoundary, upperBoundary}), httpOptions)
      .subscribe(res => console.debug("start sorting response: " + JSON.stringify(res)));
  }

  pauseSorting(): void {
    this.http.post("http://localhost:3000/stop", '', httpOptions)
      .subscribe(res => console.debug("pause sorting response: " + JSON.stringify(res)));
  }

  callStatisticsEndpoint(func: functionName, fromDate: Date, toDate: Date, ...args: any[]): Observable<any> {
    switch (func) {
      case 'ALL_CARDS': return this.getNumberOfAllCards(fromDate, toDate);
      case 'RECOGNIZED_CARDS': return this.getNumberOfRecognizedCards(fromDate, toDate);
      case 'NOT_RECOGNIZED_CARDS': return this.getNumberOfNotRecognizedCards(fromDate, toDate);
      case 'CARDS_IN_BOX': return this.getNumberOfCardsInBox(fromDate, toDate, args[0]);
      case 'CARDS_IN_BOXES': return this.getNumberOfCardsInBoxes(fromDate, toDate);
      case 'CATEGORIES_COUNT': return this.getCategoriesCount(fromDate, toDate);
      case 'SORTING_DATA_CATEGORIES': return this.getSortingDataCategories(fromDate, toDate);
    }
  }

  getNumberOfAllCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("http://localhost:3000/cardsCount/all?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  getNumberOfRecognizedCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("http://localhost:3000/cardsCount/recognized?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  getNumberOfNotRecognizedCards(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("http://localhost:3000/cardsCount/notRecognized?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  getNumberOfCardsInBox(fromDate: Date, toDate: Date, boxId: number): Observable<any> {
    return this.http.get("http://localhost:3000/cardsCount/boxes/" + boxId
      + "?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  getNumberOfCardsInBoxes(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("http://localhost:3000/cardsCount/boxes"
      + "?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  getCategoriesCount(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("http://localhost:3000/cardsCount/categories?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

  getSortingDataCategories(fromDate: Date, toDate: Date): Observable<any> {
    return this.http.get("http://localhost:3000/sortingData/categories?fromDate="
      + fromDate + "&toDate=" + toDate);
  }

}
