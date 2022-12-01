import { Component } from '@angular/core';
import {MessageService} from "./_services/message.service";
import {WebsocketService} from "./_services/websocket.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  /**
   * calls the websocket service to set up the websocket connection;
   * adds an event listener to error messages to display them as push messages
   * @param websocketService service to handle the websocket connection and listeners
   * @param messageService service to display messages
   */
  constructor(private websocketService: WebsocketService, private messageService: MessageService) {
    this.websocketService.setupSocketConnection();
    this.websocketService.addListener('error', (data: string) => {
      this.messageService.add(JSON.parse(data).message, 'ERROR', 5000);
    });
  }

  /**
   * disconnects the websocket client when component is destroyed
   */
  ngOnDestroy() {
    this.websocketService.disconnect();
  }

}
