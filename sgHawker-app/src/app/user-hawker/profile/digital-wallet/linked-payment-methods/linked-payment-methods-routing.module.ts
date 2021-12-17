import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LinkedPaymentMethodsPage } from './linked-payment-methods.page';

const routes: Routes = [
  {
    path: '',
    component: LinkedPaymentMethodsPage
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LinkedPaymentMethodsPageRoutingModule {}
