import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeluxeAcctsUpgradePage } from './deluxe-accts-upgrade.page';

const routes: Routes = [
  {
    path: '',
    component: DeluxeAcctsUpgradePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeluxeAcctsUpgradePageRoutingModule {}
