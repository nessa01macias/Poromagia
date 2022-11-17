import { Component, OnInit } from '@angular/core';
import {io, Socket} from "socket.io-client";
import {environment} from "../../environments/environment";
import {SortingCategory} from "../_utils/SortingCategory";
import {MessageService} from "../_services/message.service";

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

  constructor(private messageService: MessageService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.socket.on('recognized card', (data: string) => {
      const parsedData = JSON.parse(data);
      this.price = parsedData.price + ' ' + SortingCategory.PRICE.unit;
      this.stock = parsedData.stock + ' ' + SortingCategory.STOCK.unit;
      this.wanted = parsedData.wanted + ' ' + SortingCategory.WANTED.unit;
      this.boxNumber = parsedData.box;
      this.imageLink = parsedData.imageLink;
    });
    this.socket.on('error', (data: string) => {
      this.messageService.add(JSON.parse(data).message, 5000);
    });
  }

  ngOnInit(): void {
  }

}
