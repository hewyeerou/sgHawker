import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddCuisineTypeModalPage } from './add-cuisine-type-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddCuisineTypeModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddCuisineTypeModalPageRoutingModule {}
