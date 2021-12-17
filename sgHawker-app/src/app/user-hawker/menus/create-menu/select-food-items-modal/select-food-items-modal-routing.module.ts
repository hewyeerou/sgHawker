import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectFoodItemsModalPage } from './select-food-items-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SelectFoodItemsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectFoodItemsModalPageRoutingModule {}
