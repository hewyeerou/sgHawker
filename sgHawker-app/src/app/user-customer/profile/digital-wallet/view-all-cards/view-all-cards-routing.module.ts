import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewAllCardsPage } from './view-all-cards.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAllCardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAllCardsPageRoutingModule {}
