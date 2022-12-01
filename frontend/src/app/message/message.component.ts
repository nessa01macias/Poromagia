import { Component } from '@angular/core';
import {MessageService} from "../_services/message.service";


/**
 * component to display push messages
 */
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {

  messages = this.messagesService.getMessages().keys();

  constructor(public messagesService: MessageService) {}

  /**
   * calls the messages service to remove the message with the given key from the messages list and stop displaying it
   * @param messageKey the key of the message to remove
   */
  closeMessage(messageKey: number): void {
    this.messagesService.remove(messageKey);
  }

}
