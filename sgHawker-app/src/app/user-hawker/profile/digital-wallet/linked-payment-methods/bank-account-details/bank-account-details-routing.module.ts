import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BankAccountDetailsPage } from './bank-account-details.page';

const routes: Routes = [
  {
    path: '',
    component: BankAccountDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankAccountDetailsPageRoutingModule {}
