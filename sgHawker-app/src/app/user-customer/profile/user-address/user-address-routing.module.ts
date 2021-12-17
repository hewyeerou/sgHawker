import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserAddressPage } from './user-address.page';

const routes: Routes = [
  {
    path: '',
    component: UserAddressPage
  },
  {
    path: 'address-details/:id',
    loadChildren: () => import('./address-details/address-details.module').then( m => m.AddressDetailsPageModule)
  },
  {
    path: 'create-address',
    loadChildren: () => import('./create-address/create-address.module').then( m => m.CreateAddressPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserAddressPageRoutingModule {}
