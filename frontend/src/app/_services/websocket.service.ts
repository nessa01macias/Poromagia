import { Injectable } from '@angular/core';
import {io, Socket} from "socket.io-client";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket: Socket | undefined;

  constructor() {   }

  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  addListener(type: string, listenerFunction: (data: string) => void) {
    if (this.socket) {
      this.socket.on(type, listenerFunction);
    }
  }

  removeListener(type: string, listenerFunction: (data: string) => void) {
    if (this.socket) {
      this.socket.off(type, listenerFunction);
    }
  }
}
