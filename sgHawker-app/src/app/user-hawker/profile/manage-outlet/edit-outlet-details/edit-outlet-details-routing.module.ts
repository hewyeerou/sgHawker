import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditOutletDetailsPage } from './edit-outlet-details.page';

const routes: Routes = [
  {
    path: '',
    component: EditOutletDetailsPage
  },
  {
    path: 'add-cuisine-type-modal',
    loadChildren: () => import('./add-cuisine-type-modal/add-cuisine-type-modal.module').then( m => m.AddCuisineTypeModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditOutletDetailsPageRoutingModule {}
