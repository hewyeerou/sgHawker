import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GuestQrCodePage } from './guest-qr-code.page';

const routes: Routes = [
  {
    path: '',
    component: GuestQrCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuestQrCodePageRoutingModule {}
