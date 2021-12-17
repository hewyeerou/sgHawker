import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateAddressPage } from './create-address.page';

const routes: Routes = [
  {
    path: '',
    component: CreateAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateAddressPageRoutingModule {}
