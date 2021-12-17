import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccounttierPage } from './accounttier.page';

const routes: Routes = [
  {
    path: '',
    component: AccounttierPage
  },
  {
    path: 'confirm-subscription',
    loadChildren: () => import('./confirm-subscription/confirm-subscription.module').then( m => m.ConfirmSubscriptionPageModule)
  },
  {
    path: 'choose-plan',
    loadChildren: () => import('./choose-plan/choose-plan.module').then( m => m.ChoosePlanPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccounttierPageRoutingModule {}
