import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerStoresPage } from './hawker-stores.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerStoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerStoresPageRoutingModule {}
