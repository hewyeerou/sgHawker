import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddressDetailsPage } from './address-details.page';

const routes: Routes = [
  {
    path: '',
    component: AddressDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressDetailsPageRoutingModule {}
