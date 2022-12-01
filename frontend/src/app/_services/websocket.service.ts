import { Injectable } from '@angular/core';
import {io, Socket} from "socket.io-client";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket: Socket | undefined;

  constructor() {   }

  /**
   * connects the websocket client to the websocket server in the backend
   */
  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);
  }

  /**
   * disconnects the client from the websocket connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * adds a listener to the websocket
   * @param type the key of the messages the listener should listen to
   * @param listenerFunction the function that is executed when the websocket client receives messages with the given type (key)
   */
  addListener(type: string, listenerFunction: (data: string) => void) {
    if (this.socket) {
      this.socket.on(type, listenerFunction);
    }
  }

  /**
   * removes a listener
   * @param type the key of the messages the listener should stop listening to
   * @param listenerFunction the function that should not be executed anymore when the websocket client receives messages with the given type (key)
   */
  removeListener(type: string, listenerFunction: (data: string) => void) {
    if (this.socket) {
      this.socket.off(type, listenerFunction);
    }
  }
}
