import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewHawkerAccountDetailsPage } from './view-hawker-account-details.page';

const routes: Routes = [
  {
    path: '',
    component: ViewHawkerAccountDetailsPage
  },
  {
    path: 'create-outlet-modal',
    loadChildren: () => import('./create-outlet-modal/create-outlet-modal.module').then( m => m.CreateOutletModalPageModule)
  },
  {
    path: 'edit-outlet-modal',
    loadChildren: () => import('./edit-outlet-modal/edit-outlet-modal.module').then( m => m.EditOutletModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewHawkerAccountDetailsPageRoutingModule {}
