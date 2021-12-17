import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DigitalWalletPage } from './digital-wallet.page';

const routes: Routes = [
  {
    path: '',
    component: DigitalWalletPage
  },
  {
    path: 'card-details/:id',
    loadChildren: () => import('./card-details/card-details.module').then( m => m.CardDetailsPageModule)
  },
  {
    path: 'create-card',
    loadChildren: () => import('./create-card/create-card.module').then( m => m.CreateCardPageModule)
  },
  {
    path: 'bank-account-details/:id',
    loadChildren: () => import('./bank-account-details/bank-account-details.module').then( m => m.BankAccountDetailsPageModule)
  },
  {
    path: 'create-bank-account',
    loadChildren: () => import('./create-bank-account/create-bank-account.module').then( m => m.CreateBankAccountPageModule)
  },
  {
    path: 'view-all-cards',
    loadChildren: () => import('./view-all-cards/view-all-cards.module').then( m => m.ViewAllCardsPageModule)
  },
  {
    path: 'top-up-wallet-modal',
    loadChildren: () => import('./top-up-wallet-modal/top-up-wallet-modal.module').then( m => m.TopUpWalletModalPageModule)
  },
  {
    path: 'view-transaction-details-modal',
    loadChildren: () => import('./view-transaction-details-modal/view-transaction-details-modal.module').then( m => m.ViewTransactionDetailsModalPageModule)
  },
  {
    path: 'cashback-modal',
    loadChildren: () => import('./cashback-modal/cashback-modal.module').then( m => m.CashbackModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DigitalWalletPageRoutingModule {}
