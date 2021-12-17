import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApprovedHawkerAccountsPage } from './approved-hawker-accounts.page';

const routes: Routes = [
  {
    path: '',
    component: ApprovedHawkerAccountsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApprovedHawkerAccountsPageRoutingModule {}
