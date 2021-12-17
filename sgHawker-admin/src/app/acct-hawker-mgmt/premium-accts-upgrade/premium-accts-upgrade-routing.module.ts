import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PremiumAcctsUpgradePage } from './premium-accts-upgrade.page';

const routes: Routes = [
  {
    path: '',
    component: PremiumAcctsUpgradePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PremiumAcctsUpgradePageRoutingModule {}
