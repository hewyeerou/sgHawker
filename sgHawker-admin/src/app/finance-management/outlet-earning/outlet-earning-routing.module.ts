import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OutletEarningPage } from './outlet-earning.page';

const routes: Routes = [
  {
    path: '',
    component: OutletEarningPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OutletEarningPageRoutingModule {}
