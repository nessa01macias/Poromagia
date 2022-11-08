import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MachineInitComponent} from "./machine-init/machine-init.component";

const routes: Routes = [
  { path: '', component: MachineInitComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
