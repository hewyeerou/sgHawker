import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

import { FinanceManagementPage } from './finance-management.page';

const routes: Routes = [
  {
    path: '',
    component: FinanceManagementPage,
    children: [
      {
        path: 'outletEarnings',
        loadChildren: () => import('./outlet-earning/outlet-earning.module').then(m => m.OutletEarningPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'hawkerSubscriptions',
        loadChildren: () => import('./hawker-subscription/hawker-subscription.module').then(m => m.HawkerSubscriptionPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'platformEarnings',
        loadChildren: () => import('./platform-earning/platform-earning.module').then(m => m.PlatformEarningPageModule),
        canActivate: [AuthGuard]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceManagementPageRoutingModule { }
