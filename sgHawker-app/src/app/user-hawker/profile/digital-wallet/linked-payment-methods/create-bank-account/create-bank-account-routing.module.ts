import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateBankAccountPage } from './create-bank-account.page';

const routes: Routes = [
  {
    path: '',
    component: CreateBankAccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateBankAccountPageRoutingModule {}
