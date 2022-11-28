import { Component, OnInit } from '@angular/core';
import {SortingCategory} from "../_utils/SortingCategory";
import {MessageService} from "../_services/message.service";
import {WebsocketService} from "../_services/websocket.service";

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  price: string = '';
  stock: string = '';
  wanted: string = '';
  boxNumber: number | undefined = undefined;
  takenImageSrc: string = '';
  recognizedImageLink: string = '';
  waitingForResult: boolean = false;

  constructor(private messageService: MessageService, private websocketService: WebsocketService) {
  }

  ngOnInit(): void {
    this.websocketService.addListener('recognized card', this.cardRecognizedListener);
    this.websocketService.addListener('image', this.imageReceivedListener);
  }

  ngOnDestroy(): void {
    this.websocketService.removeListener('recognized card', this.cardRecognizedListener);
    this.websocketService.removeListener('image', this.imageReceivedListener);
  }

  private cardRecognizedListener = (data: string): void => {
    const parsedData = JSON.parse(data);
    this.price = parsedData.price + ' ' + SortingCategory.PRICE.unit;
    this.stock = parsedData.stock + ' ' + SortingCategory.STOCK.unit;
    this.wanted = parsedData.wanted + ' ' + SortingCategory.WANTED.unit;
    this.boxNumber = parsedData.box;
    this.recognizedImageLink = parsedData.imageLink;
    this.waitingForResult = false;
  }

  private imageReceivedListener = (data: string): void => {
    this.takenImageSrc = JSON.parse(data).imgSrc;
    this.waitingForResult = true;
  }

}
