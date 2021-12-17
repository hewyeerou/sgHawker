import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateCardPage } from './create-card.page';

const routes: Routes = [
  {
    path: '',
    component: CreateCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateCardPageRoutingModule {}
