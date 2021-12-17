import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CategoryChangeModalPage } from './category-change-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CategoryChangeModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryChangeModalPageRoutingModule {}
