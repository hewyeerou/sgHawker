import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewFoodItemPage } from './view-food-item.page';

const routes: Routes = [
  {
    path: '',
    component: ViewFoodItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewFoodItemPageRoutingModule {}
