import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashbackModalPage } from './cashback-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CashbackModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashbackModalPageRoutingModule {}
