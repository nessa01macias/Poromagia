import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MachineInitComponent} from "./machine-init/machine-init.component";
import {StatusComponent} from "./status/status.component";
import {StatisticsComponent} from "./statistics/statistics.component";
import {ManualComponent} from "./manual/manual.component";

const routes: Routes = [
  { path: '', component: MachineInitComponent },
  { path: 'status', component: StatusComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'manual', component: ManualComponent },
  { path: '**',   redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
