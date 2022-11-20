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
  takenImageSrc: string = '';
  recognizedImageLink: string = '';
  waitingForResult: boolean = false;

  constructor(private messageService: MessageService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.socket.on('recognized card', (data: string) => {
      const parsedData = JSON.parse(data);
      this.price = parsedData.price + ' ' + SortingCategory.PRICE.unit;
      this.stock = parsedData.stock + ' ' + SortingCategory.STOCK.unit;
      this.wanted = parsedData.wanted + ' ' + SortingCategory.WANTED.unit;
      this.boxNumber = parsedData.box;
      this.recognizedImageLink = parsedData.imageLink;
      this.waitingForResult = false;
    });
    this.socket.on('error', (data: string) => {
      this.messageService.add(JSON.parse(data).message, 'ERROR', 5000);
    });
    this.socket.on('image', (data: string) => {
      this.takenImageSrc = JSON.parse(data).imgSrc;
      this.waitingForResult = true;
    });
  }

  ngOnInit(): void {
  }

}
