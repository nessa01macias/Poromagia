import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private messages: Map<number, string> = new Map<number, string>();

  add(message: string, displayTime: number): void {
    let messageKey: number = 0;
    if (this.messages.size > 0) {
      messageKey = Math.max(...this.messages.keys()) + 1
    }
    this.messages.set(messageKey, message);

    setTimeout(() => {
      this.remove(messageKey);
    }, displayTime);
  }

  remove(messageKey: number): void {
    this.messages.delete(messageKey);
  }

  getMessages(): Map<number, string> {
    return this.messages;
  }
}
