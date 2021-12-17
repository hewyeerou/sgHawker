import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerDetailsPage } from './hawker-details.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerDetailsPageRoutingModule {}
