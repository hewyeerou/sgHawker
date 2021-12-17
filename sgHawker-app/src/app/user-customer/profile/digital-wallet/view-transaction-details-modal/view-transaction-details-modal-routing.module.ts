import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTransactionDetailsModalPage } from './view-transaction-details-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ViewTransactionDetailsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewTransactionDetailsModalPageRoutingModule {}
