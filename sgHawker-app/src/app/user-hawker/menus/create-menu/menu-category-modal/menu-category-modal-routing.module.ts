import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuCategoryModalPage } from './menu-category-modal.page';

const routes: Routes = [
  {
    path: '',
    component: MenuCategoryModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuCategoryModalPageRoutingModule {}
