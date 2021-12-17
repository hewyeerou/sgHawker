import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateOutletModalPage } from './create-outlet-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CreateOutletModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateOutletModalPageRoutingModule {}
