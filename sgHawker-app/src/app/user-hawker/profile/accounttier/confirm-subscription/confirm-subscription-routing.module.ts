import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmSubscriptionPage } from './confirm-subscription.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmSubscriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmSubscriptionPageRoutingModule {}
