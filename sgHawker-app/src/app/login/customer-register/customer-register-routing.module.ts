import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerRegisterPage } from './customer-register.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerRegisterPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRegisterPageRoutingModule {}
