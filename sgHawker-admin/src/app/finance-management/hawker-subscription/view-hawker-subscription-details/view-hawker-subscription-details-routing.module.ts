import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewHawkerSubscriptionDetailsPage } from './view-hawker-subscription-details.page';

const routes: Routes = [
  {
    path: '',
    component: ViewHawkerSubscriptionDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewHawkerSubscriptionDetailsPageRoutingModule {}
