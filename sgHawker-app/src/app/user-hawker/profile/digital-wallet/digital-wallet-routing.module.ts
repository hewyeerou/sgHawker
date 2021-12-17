import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DigitalWalletPage } from './digital-wallet.page';

const routes: Routes = [
  {
    path: '',
    component: DigitalWalletPage
  },
  {
    path: 'linked-payment-methods',
    loadChildren: () => import('./linked-payment-methods/linked-payment-methods.module').then( m => m.LinkedPaymentMethodsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DigitalWalletPageRoutingModule {}
