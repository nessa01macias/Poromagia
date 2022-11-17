import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private messages: string[] = [];

  add(message: string, displayTime: number): void {
    this.messages.push(message);
    setTimeout(() => {
      this.messages = [];
    }, displayTime);
  }

  getMessages(): string[] {
    return this.messages;
  }
}
