import { Injectable } from '@angular/core';

export type MessageType = 'ERROR' | 'WARNING' | 'SUCCESS';
export type Message = {
  text: string,
  type: MessageType
}


/**
 * service for handling messages displayed for a limited time period
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private messages: Map<number, Message> = new Map<number, Message>();

  /**
   * add a message with a new unique key to the messages list and removes it after the given time; type is used for styling the message
   * @param message the message to be displayed
   * @param type the type of the message (error, warning or success)
   * @param displayTime the time the message should be displayed
   */
  add(message: string, type: MessageType, displayTime: number): void {
    let messageKey: number = 0;
    if (this.messages.size > 0) {
      messageKey = Math.max(...this.messages.keys()) + 1
    }
    this.messages.set(messageKey, {text: message, type});

    setTimeout(() => {
      this.remove(messageKey);
    }, displayTime);
  }

  /**
   * removes a message from the messages list
   * @param messageKey the key of the message to remove
   */
  remove(messageKey: number): void {
    this.messages.delete(messageKey);
  }

  /**
   * getter to return all messages in the messages list
   */
  getMessages(): Map<number, Message> {
    return this.messages;
  }
}
