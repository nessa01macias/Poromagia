import { Component, OnInit } from '@angular/core';
import {SortingCategory} from "../_utils/SortingCategory";
import {MessageService} from "../_services/message.service";
import {WebsocketService} from "../_services/websocket.service";
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';


/**
 * component to display the currently processed card
 */
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
  takenImageSrc: SafeResourceUrl = '';
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

  /**
   * reads the status values from the local storage and sets the values accordingly
   * @param messageService service to display messages
   * @param websocketService service to handle the websocket connection and listeners
   * @param sanitizer sanitizer used for binding an image URL
   */
  constructor(private messageService: MessageService, private websocketService: WebsocketService, private sanitizer: DomSanitizer) {
    const storedStatus = localStorage.getItem(this.recognizeCardStatus);
    if (storedStatus) {
      const storedStatusParsed = JSON.parse(storedStatus);
      this.takenImageSrc = storedStatusParsed[this.takenImageKey].changingThisBreaksApplicationSecurity;
      this.recognizedImageLink = storedStatusParsed[this.recognizedImageKey];
      this.price = storedStatusParsed[this.priceKey];
      this.stock = storedStatusParsed[this.stockKey];
      this.wanted = storedStatusParsed[this.wantedKey];
      this.boxNumber = storedStatusParsed[this.boxKey];
      if (this.takenImageSrc && !this.recognizedImageLink) this.waitingForResult = true;
    }
  }

  /**
   * adds two listeners listening on the taken image and the data of the recognized cards
   */
  ngOnInit(): void {
    this.websocketService.addListener('recognized card', this.cardRecognizedListener);
    this.websocketService.addListener('image', this.imageReceivedListener);
  }

  /**
   * removes the websocket listeners when the component is destroyed
   */
  ngOnDestroy(): void {
    this.websocketService.removeListener('recognized card', this.cardRecognizedListener);
    this.websocketService.removeListener('image', this.imageReceivedListener);
  }

  /**
   * listener to get the values of the recognized card, display them and store them in the local storage
   * @param data the data send via websocket containing the values of the recognized card
   */
  cardRecognizedListener = (data: string): void => {
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

  /**
   * listener to get the image taken before recognizing the card, display it and store it in the local storage
   * @param data the data send via websocket containing the taken picture
   */
  imageReceivedListener = (data: string): void => {
    this.takenImageSrc = this.sanitizer.bypassSecurityTrustResourceUrl(JSON.parse(data).raspImg);
    this.waitingForResult = true;
    localStorage.setItem(this.recognizeCardStatus, JSON.stringify({[this.takenImageKey]: this.takenImageSrc}));
  }

}
