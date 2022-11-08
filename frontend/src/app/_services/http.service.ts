import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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

  recognizePic(): Observable<any> {
    return this.http.post("http://localhost:3000/recognize", '', httpOptions);
  }

}
