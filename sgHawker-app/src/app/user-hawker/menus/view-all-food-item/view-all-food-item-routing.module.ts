import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewAllFoodItemPage } from './view-all-food-item.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAllFoodItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAllFoodItemPageRoutingModule {}
