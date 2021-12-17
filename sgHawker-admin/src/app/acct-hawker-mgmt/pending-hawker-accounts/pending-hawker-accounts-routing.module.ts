import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingHawkerAccountsPage } from './pending-hawker-accounts.page';

const routes: Routes = [
  {
    path: '',
    component: PendingHawkerAccountsPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingHawkerAccountsPageRoutingModule { }
