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

  /* keys and values for local storage */
  private readonly recognizeCardStatus = 'CARD_STATUS';
  private readonly takenImageKey = 'takenImage';
  private readonly recognizedImageKey = 'recognizedImage';
  private readonly priceKey = 'price';
  private readonly stockKey = 'stock';
  private readonly wantedKey = 'wanted';
  private readonly boxKey = 'box';

  constructor(private messageService: MessageService, private websocketService: WebsocketService) {
    const storedStatus = localStorage.getItem(this.recognizeCardStatus);
    if (storedStatus) {
      const storedStatusParsed = JSON.parse(storedStatus);
      this.takenImageSrc = storedStatusParsed[this.takenImageKey];
      this.recognizedImageLink = storedStatusParsed[this.recognizedImageKey];
      this.price = storedStatusParsed[this.priceKey];
      this.stock = storedStatusParsed[this.stockKey];
      this.wanted = storedStatusParsed[this.wantedKey];
      this.boxNumber = storedStatusParsed[this.boxKey];
      if (this.takenImageSrc && !this.recognizedImageLink) this.waitingForResult = true;
    }
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

    // store values in local storage
    const storedStatus = localStorage.getItem(this.recognizeCardStatus);
    const storedStatusParsed = storedStatus ? JSON.parse(storedStatus) : {};
    storedStatusParsed[this.recognizedImageKey] = this.recognizedImageLink;
    storedStatusParsed[this.priceKey] = this.price;
    storedStatusParsed[this.stockKey] = this.stock;
    storedStatusParsed[this.wantedKey] = this.wanted;
    storedStatusParsed[this.boxKey] = this.boxNumber;
    localStorage.setItem(this.recognizeCardStatus, JSON.stringify(storedStatusParsed));
  }

  private imageReceivedListener = (data: string): void => {
    this.takenImageSrc = JSON.parse(data).imgSrc;
    this.waitingForResult = true;
    localStorage.setItem(this.recognizeCardStatus, JSON.stringify({[this.takenImageKey]: this.takenImageSrc}));
  }

}
