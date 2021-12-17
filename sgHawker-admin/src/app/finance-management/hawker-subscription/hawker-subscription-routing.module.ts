import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerSubscriptionPage } from './hawker-subscription.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerSubscriptionPage
  },
  {
    path: 'viewHawkerSubscriptionDetails/:id',
    loadChildren: () => import('./view-hawker-subscription-details/view-hawker-subscription-details.module').then( m => m.ViewHawkerSubscriptionDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerSubscriptionPageRoutingModule {}
