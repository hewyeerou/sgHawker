import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

import { HawkerMgmtNavPage } from './hawker-mgmt-nav.page';


const routes: Routes = [
  {
    path: '',
    component: HawkerMgmtNavPage,
    children: [
      {
        path: 'pendingHawkerAccounts',
        loadChildren: () => import('../pending-hawker-accounts/pending-hawker-accounts.module').then(m => m.PendingHawkerAccountsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'approvedHawkerAccounts',
        loadChildren: () => import('../approved-hawker-accounts/approved-hawker-accounts.module').then(m => m.ApprovedHawkerAccountsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'viewHawkerAccountDetails/:id',
        loadChildren: () => import('../view-hawker-account-details/view-hawker-account-details.module').then(m => m.ViewHawkerAccountDetailsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: '/hawkerAccountManagement/pendingHawkerAccounts',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerMgmtNavPageRoutingModule { }
