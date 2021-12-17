import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerAccountDetailsPage } from './hawker-account-details.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerAccountDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerAccountDetailsPageRoutingModule {}
