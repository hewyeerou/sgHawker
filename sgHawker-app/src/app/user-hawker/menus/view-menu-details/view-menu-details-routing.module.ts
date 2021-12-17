import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewMenuDetailsPage } from './view-menu-details.page';

const routes: Routes = [
  {
    path: '',
    component: ViewMenuDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewMenuDetailsPageRoutingModule {}
