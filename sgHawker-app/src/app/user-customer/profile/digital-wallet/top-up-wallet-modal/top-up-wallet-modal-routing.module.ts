import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TopUpWalletModalPage } from './top-up-wallet-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TopUpWalletModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TopUpWalletModalPageRoutingModule {}
