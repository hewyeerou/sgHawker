import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

import { HawkerAcctUpgradeNavPage } from './hawker-acct-upgrade-nav.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerAcctUpgradeNavPage,
    children: [
      {
        path: 'premiumAcctsUpgrade',
        loadChildren: () => import('../premium-accts-upgrade/premium-accts-upgrade.module').then( m => m.PremiumAcctsUpgradePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'deluxeAcctsUpgrade',
        loadChildren: () => import('../deluxe-accts-upgrade/deluxe-accts-upgrade.module').then( m => m.DeluxeAcctsUpgradePageModule),
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerAcctUpgradeNavPageRoutingModule {}
