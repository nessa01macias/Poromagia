import { Component, OnInit } from '@angular/core';
import {io, Socket} from "socket.io-client";
import {environment} from "../../environments/environment";
import {SortingCategory} from "../_utils/SortingCategory";

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  socket: Socket | undefined;

  price: string = '';
  stock: string = '';
  wanted: string = '';
  boxNumber: number | undefined = undefined;
  imageLink: string = '';

  constructor() {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.socket.on('recognized card', (data: string) => {
      const parsedData = JSON.parse(data);
      this.price = parsedData.price + ' ' + SortingCategory.PRICE.unit;
      this.stock = parsedData.stock + ' ' + SortingCategory.STOCK.unit;
      this.wanted = parsedData.wanted + ' ' + SortingCategory.WANTED.unit;
      this.boxNumber = parsedData.box;
      this.imageLink = parsedData.imageLink;
    });
  }

  ngOnInit(): void {
  }

}
