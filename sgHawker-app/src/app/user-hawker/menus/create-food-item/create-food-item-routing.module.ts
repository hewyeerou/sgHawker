import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateFoodItemPage } from './create-food-item.page';

const routes: Routes = [
  {
    path: '',
    component: CreateFoodItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateFoodItemPageRoutingModule {}
