import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  {
    path: 'manage-outlet',
    loadChildren: () => import('../profile/manage-outlet/manage-outlet.module').then(m => m.ManageOutletPageModule)
  },
  {
    path: 'manage-outlet/:id',
    loadChildren: () => import('../profile/manage-outlet/manage-outlet.module').then(m => m.ManageOutletPageModule)
  },
  {
    path: 'hawker-account-details',
    loadChildren: () => import('../profile/hawker-account-details/hawker-account-details.module')
      .then(m => m.HawkerAccountDetailsPageModule)
  },
  {
    path: 'hawkertier',
    loadChildren: () => import('../profile/accounttier/accounttier.module').then(m => m.AccounttierPageModule),
  },
  {
    path: 'digital-wallet',
    loadChildren: () => import('../profile/digital-wallet/digital-wallet.module').then(m => m.DigitalWalletPageModule),
  },
  {
    path: 'view-reports',
    loadChildren: () => import('./view-reports/view-reports.module').then( m => m.ViewReportsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule { }
