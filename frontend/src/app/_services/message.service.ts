import { Injectable } from '@angular/core';

export type MessageType = 'ERROR' | 'WARNING' | 'SUCCESS';
export type Message = {
  text: string,
  type: MessageType
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private messages: Map<number, Message> = new Map<number, Message>();

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

  remove(messageKey: number): void {
    this.messages.delete(messageKey);
  }

  getMessages(): Map<number, Message> {
    return this.messages;
  }
}
