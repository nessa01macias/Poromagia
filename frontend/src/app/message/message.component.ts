import { Component } from '@angular/core';
import {MessageService} from "../_services/message.service";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {

  messages = this.messagesService.getMessages().keys();

  constructor(public messagesService: MessageService) {}

  closeMessage(messageKey: number): void {
    this.messagesService.remove(messageKey);
  }

}
