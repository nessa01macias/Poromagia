import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {MachineInitComponent} from "./machine-init/machine-init.component";
import { StatusComponent } from './status/status.component';
import { NavigationComponent } from './navigation/navigation.component';
import { MessageComponent } from './message/message.component';
import {MatIconModule} from '@angular/material/icon';
import { ManualComponent } from './manual/manual.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { GraphComponent } from './graph/graph.component';

@NgModule({
  declarations: [
    AppComponent,
    MachineInitComponent,
    StatusComponent,
    NavigationComponent,
    MessageComponent,
    ManualComponent,
    StatisticsComponent,
    GraphComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        MatIconModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
