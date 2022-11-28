import { Component } from '@angular/core';
import {MessageService} from "./_services/message.service";
import {WebsocketService} from "./_services/websocket.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private websocketService: WebsocketService, private messageService: MessageService) {
    this.websocketService.setupSocketConnection();
    this.websocketService.addListener('error', (data: string) => {
      this.messageService.add(JSON.parse(data).message, 'ERROR', 5000);
    });
  }

  ngOnDestroy() {
    this.websocketService.disconnect();
  }

}
