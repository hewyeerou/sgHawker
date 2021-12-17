import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerRegisterPage } from './hawker-register.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerRegisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerRegisterPageRoutingModule {}
