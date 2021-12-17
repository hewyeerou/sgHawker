import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewOutletQrPage } from './view-outlet-qr.page';

const routes: Routes = [
  {
    path: '',
    component: ViewOutletQrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewOutletQrPageRoutingModule {}
