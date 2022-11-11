import { Component, OnInit } from '@angular/core';
import {io, Socket} from "socket.io-client";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  socket: Socket | undefined;

  price: number | undefined = undefined;
  stock: number | undefined = undefined;
  wanted: boolean | undefined = undefined;
  boxNumber: number | undefined = undefined;

  constructor() {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.socket.on('recognized card', (data: string) => {
      const parsedData = JSON.parse(data);
      this.price = parsedData.price;
      this.stock = parsedData.stock;
      this.wanted = parsedData.wanted;
      this.boxNumber = parsedData.box;
    });
  }

  ngOnInit(): void {
  }

}
