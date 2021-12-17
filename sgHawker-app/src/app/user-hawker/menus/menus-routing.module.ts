import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenusPage } from './menus.page';

const routes: Routes = [
  {
    path: '',
    component: MenusPage,
  },
  {
    path: 'create-menu',
    loadChildren: () =>
      import('./create-menu/create-menu.module').then(
        (m) => m.CreateMenuPageModule
      ),
  },
  {
    path: 'create-menu/:id',
    loadChildren: () =>
      import('./create-menu/create-menu.module').then(
        (m) => m.CreateMenuPageModule
      ),
  },
  {
    path: 'create-food-item',
    loadChildren: () =>
      import('./create-food-item/create-food-item.module').then(
        (m) => m.CreateFoodItemPageModule
      ),
  },
  {
    path: 'customization',
    loadChildren: () =>
      import('./customization/customization.module').then(
        (m) => m.CustomizationPageModule
      ),
  },
  {
    path: 'view-menu-details',
    loadChildren: () =>
      import('./view-menu-details/view-menu-details.module').then(
        (m) => m.ViewMenuDetailsPageModule
      ),
  },
  {
    path: 'view-menu-details/:id',
    loadChildren: () =>
      import('./view-menu-details/view-menu-details.module').then(
        (m) => m.ViewMenuDetailsPageModule
      ),
  },
  {
    path: 'view-all-food-item',
    loadChildren: () =>
      import('./view-all-food-item/view-all-food-item.module').then(
        (m) => m.ViewAllFoodItemPageModule
      ),
  },
  {
    path: 'view-food-item',
    loadChildren: () =>
      import('./view-food-item/view-food-item.module').then(
        (m) => m.ViewFoodItemPageModule
      ),
  },
  {
    path: 'edit-customization',
    loadChildren: () =>
      import('./edit-customization/edit-customization.module').then(
        (m) => m.EditCustomizationPageModule
      ),
  },
  {
    path: 'category-change-modal',
    loadChildren: () =>
      import('./category-change-modal/category-change-modal.module').then(
        (m) => m.CategoryChangeModalPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenusPageRoutingModule { }
