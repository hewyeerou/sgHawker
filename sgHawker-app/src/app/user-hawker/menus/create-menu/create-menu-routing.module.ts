import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateMenuPage } from './create-menu.page';

const routes: Routes = [
  {
    path: '',
    component: CreateMenuPage
  },
  {
    path: 'create-food-bundle',
    loadChildren: () => import('../create-menu/create-food-bundle/create-food-bundle.module').then( m => m.CreateFoodBundlePageModule)
  },
  {
    path: 'select-food-items-modal',
    // eslint-disable-next-line max-len
    loadChildren: () => import('../create-menu/select-food-items-modal/select-food-items-modal.module').then( m => m.SelectFoodItemsModalPageModule)
  },
  {
    path: 'menu-category-modal',
    loadChildren: () => import('./menu-category-modal/menu-category-modal.module').then( m => m.MenuCategoryModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateMenuPageRoutingModule {}
