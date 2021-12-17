import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateFoodBundlePage } from './create-food-bundle.page';

const routes: Routes = [
  {
    path: '',
    component: CreateFoodBundlePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateFoodBundlePageRoutingModule {}
