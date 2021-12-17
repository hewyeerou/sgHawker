import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashOrderModalPage } from './cash-order-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CashOrderModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashOrderModalPageRoutingModule {}
